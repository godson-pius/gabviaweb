"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  limit,
  getDocs,
  getCountFromServer,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Profile } from "@/types/chat";
import {
  getOrGenerateKeyPair,
  encryptPrivateKeyForBackup,
  decryptPrivateKeyFromBackup,
  saveRecoveredPrivateKey,
} from "@/lib/e2ee";
import {
  EARLY_ADOPTER_LIMIT,
  EARLY_ADOPTER_PLAN,
  STANDARD_PLAN,
} from "@/lib/constants";
import { awardMilestonePoints } from "@/lib/rewards";
import {
  checkLoginAttempts,
  recordFailedLoginAttempt,
  clearLoginAttempts,
} from "@/lib/security";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  keyPair: { publicKeyBase64: string; privateKeyUint8: Uint8Array } | null;
  loading: boolean;
  needsKeyRecovery: boolean;
  hasBackup: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (params: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    language: string;
    referralCode?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setupBackup: (pin: string) => Promise<void>;
  recoverKeys: (pin: string) => Promise<boolean>;
  updateLanguage: (language: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  gabPoints: number;
  deductPoints: (amount?: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [keyPair, setKeyPair] = useState<{ publicKeyBase64: string; privateKeyUint8: Uint8Array } | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsKeyRecovery, setNeedsKeyRecovery] = useState(false);
  const [hasBackup, setHasBackup] = useState(false);
  const profileRef = useRef<Profile | null>(null);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const gabPoints = profile?.gab_points ?? 0;

  const deductPoints = useCallback(
    async (amount: number = 1) => {
      if (!user) return;
      const currentPoints = profileRef.current?.gab_points ?? profile?.gab_points ?? 0;
      const newPoints = Math.max(0, currentPoints - amount);

      try {
        const pRef = doc(db, "profiles", user.uid);
        await updateDoc(pRef, {
          gab_points: newPoints,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error("[Auth] Error deducting GAB points:", err);
      }
    },
    [user, profile]
  );

  // 1. Listen for Firebase Auth user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setKeyPair(null);
        setNeedsKeyRecovery(false);
        setHasBackup(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen for profile changes
  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, "profiles", user.uid);
    const unsubscribe = onSnapshot(
      profileRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = { ...snapshot.data(), id: snapshot.id } as Profile;
          setProfile(data);
          const hasValidBackup = Boolean(data.encrypted_private_key && data.encrypted_private_key.includes(":"));
          setHasBackup(hasValidBackup);
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        console.warn("Profile listener error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 3. Initialize E2EE KeyPair
  useEffect(() => {
    if (!user || !profile) return;

    let isMounted = true;
    async function initKeys() {
      try {
        const { publicKeyBase64, privateKeyUint8, isNew } = await getOrGenerateKeyPair(user?.uid);
        if (!isMounted) return;

        setKeyPair({ publicKeyBase64, privateKeyUint8 });

        const hasValidBackup = Boolean(profile?.encrypted_private_key && profile.encrypted_private_key.includes(":"));

        // If it's a new browser device and there is a backup on server, prompt recovery
        if (isNew && hasValidBackup) {
          setNeedsKeyRecovery(true);
          return;
        }

        setNeedsKeyRecovery(false);

        // Ensure server has public key synced
        if (!profile?.public_key || (!hasValidBackup && isNew)) {
          await updateDoc(doc(db, "profiles", user!.uid), {
            public_key: publicKeyBase64,
          });
        }
      } catch (err) {
        console.error("E2EE Init error:", err);
      }
    }

    initKeys();
    return () => {
      isMounted = false;
    };
  }, [user, profile]);

  const signIn = async (identifier: string, pass: string) => {
    const attemptStatus = checkLoginAttempts();
    if (!attemptStatus.allowed) {
      throw new Error(`Too many failed login attempts. Please wait ${attemptStatus.remainingSeconds} seconds.`);
    }

    let targetEmail = identifier.trim().toLowerCase();

    // If identifier doesn't contain '@', resolve username
    if (!targetEmail.includes("@")) {
      try {
        const res = await fetch("/api/auth/resolve-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: targetEmail }),
        });
        const data = await res.json() as { ok?: boolean; email?: string; error?: string };
        if (!res.ok || !data.ok || !data.email) {
          recordFailedLoginAttempt();
          throw new Error(data.error || "No account found with this username.");
        }
        targetEmail = data.email.toLowerCase();
      } catch (err: unknown) {
        recordFailedLoginAttempt();
        const errObj = err as { message?: string };
        throw new Error(errObj.message || "Could not resolve username.");
      }
    }

    try {
      await signInWithEmailAndPassword(auth, targetEmail, pass);
      clearLoginAttempts();
    } catch (authErr: unknown) {
      recordFailedLoginAttempt();
      const errObj = authErr as { code?: string; message?: string };
      let msg = "Invalid email or password.";
      if (errObj.code === "auth/user-not-found" || errObj.code === "auth/wrong-password" || errObj.code === "auth/invalid-credential") {
        msg = "Incorrect email/username or password.";
      } else if (errObj.code === "auth/too-many-requests") {
        msg = "Access temporarily blocked due to many failed attempts. Reset your password or try again later.";
      } else if (errObj.message) {
        msg = errObj.message;
      }
      throw new Error(msg);
    }
  };

  const signUp = async (params: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    language: string;
    referralCode?: string;
  }) => {
    const normalizedEmail = params.email.trim().toLowerCase();
    const trimmedUsername = params.username.trim().toLowerCase().replace(/^@/, "");
    const trimmedFullName = params.fullName.trim();

    // Find unique username
    let finalUsername = trimmedUsername;
    let isUnique = false;
    let attempt = 0;
    const profilesRef = collection(db, "profiles");

    while (!isUnique && attempt < 5) {
      const checkUsername = attempt === 0 ? finalUsername : `${finalUsername}${Math.floor(Math.random() * 1000)}`;
      const [lowerSnap, exactSnap] = await Promise.all([
        getDocs(query(profilesRef, where("username_lower", "==", checkUsername), limit(1))),
        getDocs(query(profilesRef, where("username", "==", checkUsername), limit(1))),
      ]);

      if (lowerSnap.empty && exactSnap.empty) {
        finalUsername = checkUsername;
        isUnique = true;
      } else {
        attempt++;
      }
    }

    if (!isUnique) {
      finalUsername = `${trimmedUsername}${Date.now().toString().slice(-4)}`;
    }

    // Determine early adopter status
    let signupPosition = 1;
    try {
      const countSnap = await getCountFromServer(profilesRef);
      signupPosition = countSnap.data().count + 1;
    } catch {
      // Fallback
    }
    const isEarlyAdopter = signupPosition <= EARLY_ADOPTER_LIMIT;

    // Create Firebase Auth user
    const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, params.password);
    const newUser = cred.user;

    // Generate local E2EE keys
    const { publicKeyBase64, privateKeyUint8 } = await getOrGenerateKeyPair(newUser.uid);
    setKeyPair({ publicKeyBase64, privateKeyUint8 });

    // Handle referral code if provided
    let referredBy: string | null = null;
    if (params.referralCode?.trim()) {
      try {
        const refLower = params.referralCode.trim().toLowerCase().replace(/^@/, "");
        const [refLowerSnap, refExactSnap] = await Promise.all([
          getDocs(query(profilesRef, where("username_lower", "==", refLower), limit(1))),
          getDocs(query(profilesRef, where("username", "==", params.referralCode.trim()), limit(1))),
        ]);
        const referrerDoc = !refLowerSnap.empty ? refLowerSnap.docs[0] : (!refExactSnap.empty ? refExactSnap.docs[0] : null);
        if (referrerDoc) {
          referredBy = referrerDoc.id;
        }
      } catch (err) {
        console.warn("Referral lookup failed:", err);
      }
    }

    // Create profile document
    await setDoc(doc(db, "profiles", newUser.uid), {
      id: newUser.uid,
      email: normalizedEmail,
      full_name: trimmedFullName,
      username: finalUsername,
      username_lower: finalUsername.toLowerCase(),
      native_language: params.language || "English",
      native_language_updated_at: new Date().toISOString(),
      gab_points: 500,
      bonus_plan: isEarlyAdopter ? EARLY_ADOPTER_PLAN : STANDARD_PLAN,
      bonus_claims: isEarlyAdopter ? { signup_bonus: true } : {},
      signup_position: signupPosition,
      show_start_chat_guide_modal: true,
      referred_by: referredBy,
      public_key: publicKeyBase64,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Send onboarding email asynchronously
    fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        full_name: trimmedFullName,
        user_id: newUser.uid,
      }),
    }).catch((err) => console.warn("Onboarding email notification skipped:", err));
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setKeyPair(null);
  };

  const resetPassword = async (email: string) => {
    const normalized = email.trim().toLowerCase();
    await sendPasswordResetEmail(auth, normalized);
  };

  const setupBackup = async (pin: string) => {
    if (!user || !profile) return;
    const { privateKeyUint8, publicKeyBase64 } = await getOrGenerateKeyPair(user.uid);
    const encrypted = encryptPrivateKeyForBackup(privateKeyUint8, pin, user.uid);

    await updateDoc(doc(db, "profiles", user.uid), {
      encrypted_private_key: encrypted,
      public_key: publicKeyBase64,
      updated_at: new Date().toISOString(),
    });
    setHasBackup(true);
    await awardMilestonePoints(user.uid, "backup_pin");
  };

  const recoverKeys = async (pin: string): Promise<boolean> => {
    if (!user || !profile?.encrypted_private_key) return false;
    const decrypted = decryptPrivateKeyFromBackup(profile.encrypted_private_key, pin, user.uid);
    if (!decrypted) return false;

    await saveRecoveredPrivateKey(decrypted, user.uid);
    const { publicKeyBase64 } = await getOrGenerateKeyPair(user.uid);
    setKeyPair({ publicKeyBase64, privateKeyUint8: decrypted });
    setNeedsKeyRecovery(false);
    return true;
  };

  const updateLanguage = async (newLanguage: string) => {
    if (!user) return;
    await updateDoc(doc(db, "profiles", user.uid), {
      native_language: newLanguage,
      native_language_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, "profiles", user.uid));
    if (snap.exists()) {
      setProfile({ ...snap.data(), id: snap.id } as Profile);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        keyPair,
        loading,
        needsKeyRecovery,
        hasBackup,
        signIn,
        signUp,
        signOut,
        resetPassword,
        setupBackup,
        recoverKeys,
        updateLanguage,
        refreshProfile,
        gabPoints,
        deductPoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
