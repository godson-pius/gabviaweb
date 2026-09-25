"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
  limit,
  arrayUnion,
  arrayRemove,
  deleteField,
  deleteDoc,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { ConversationWithDetails, Message, Profile } from "@/types/chat";
import { encryptMessage, decryptMessage } from "@/lib/e2ee";
import { validateMessage } from "@/lib/security";
import { translateText, isSameLanguageOrIdentical } from "@/lib/translation";
import { sendPushNotifications, PushNotificationItem } from "@/lib/notifications";
import { awardMilestonePoints } from "@/lib/rewards";

const profileCache: Record<string, Profile> = {};
const globalTranslationCache: Record<string, string> = {};

function saveTranslationToStorage(conversationId: string, language: string, messageId: string, content: string) {
  if (typeof window === "undefined") return;
  try {
    const key = `gabvia_web_translations_${conversationId}_${language}`;
    const raw = localStorage.getItem(key);
    const map = raw ? JSON.parse(raw) : {};
    map[messageId] = content;
    localStorage.setItem(key, JSON.stringify(map));
  } catch {}
}

export function useWebChat() {
  const { user, keyPair, profile, deductPoints } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeParticipantProfiles, setActiveParticipantProfiles] = useState<Record<string, Profile>>({});
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const participantProfilesRef = useRef<Record<string, Profile>>({});
  const profileRef = useRef<Profile | null>(profile);
  const translationInFlightRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // 1. Listen for user's conversations
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("last_message_at", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const list: ConversationWithDetails[] = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
              const otherUserId = (data.participants as string[])?.find((id) => id !== user.uid);

              let otherProfile: Profile | null = null;
              if (otherUserId) {
                if (profileCache[otherUserId]) {
                  otherProfile = profileCache[otherUserId];
                } else {
                  try {
                    const pSnap = await getDoc(doc(db, "profiles", otherUserId));
                    if (pSnap.exists()) {
                      otherProfile = { ...pSnap.data(), id: pSnap.id } as Profile;
                      profileCache[otherUserId] = otherProfile;
                    }
                  } catch (e) {
                    console.warn("Could not fetch profile for", otherUserId, e);
                  }
                }
              }

              const lastMsgAt = data.last_message_at?.toDate
                ? data.last_message_at.toDate().toISOString()
                : (data.last_message_at || "");

              return {
                id: docSnap.id,
                type: data.type || "direct",
                name: data.name,
                admin_id: data.admin_id,
                participants: data.participants || [],
                pending_participants: data.pending_participants || [],
                pinned_event: data.pinned_event || null,
                other_user: otherProfile,
                last_message: data.last_message || "",
                last_message_at: lastMsgAt,
                unread_count: data.unread_count || {},
              };
            })
          );

          setConversations(list);
          setLoadingConversations(false);
        } catch (err) {
          console.warn("Conversations listener error:", err);
          setLoadingConversations(false);
        }
      },
      (error) => {
        console.error("Conversations snapshot failed:", error);
        setLoadingConversations(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 2. Fetch profiles for current active conversation participants
  useEffect(() => {
    if (!activeConversation) return;

    let isMounted = true;
    async function loadProfiles() {
      const map: Record<string, Profile> = {};
      for (const pId of activeConversation!.participants) {
        if (profileCache[pId]) {
          map[pId] = profileCache[pId];
        } else {
          try {
            const snap = await getDoc(doc(db, "profiles", pId));
            if (snap.exists()) {
              const pData = { ...snap.data(), id: snap.id } as Profile;
              profileCache[pId] = pData;
              map[pId] = pData;
            }
          } catch {}
        }
      }
      if (isMounted) {
        setActiveParticipantProfiles(map);
        participantProfilesRef.current = map;
      }
    }

    loadProfiles();
    return () => {
      isMounted = false;
    };
  }, [activeConversation]);

  // 3. Mark active conversation as read
  useEffect(() => {
    if (!user || !activeConversationId) return;

    const unreadCount = activeConversation?.unread_count?.[user.uid];
    if (unreadCount && unreadCount > 0) {
      const convoRef = doc(db, "conversations", activeConversationId);
      updateDoc(convoRef, {
        [`unread_count.${user.uid}`]: 0,
      }).catch(() => {});
    }
  }, [user, activeConversationId, activeConversation]);

  // 4. Hydrate translations and listen for messages in the active conversation
  const hydrateTranslationForMessage = async (msg: Message, conversationId: string, myLang: string) => {
    if (!msg.content || !msg.content.trim() || msg.sender_id === user?.uid) return;
    if (msg.decryption_failed) return;

    const tKey = `${conversationId}:${msg.id}:${myLang}`;
    if (globalTranslationCache[tKey]) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? { ...m, translated_content: globalTranslationCache[tKey], is_translated: true, is_translation_loading: false }
            : m
        )
      );
      return;
    }

    if (translationInFlightRef.current.has(tKey)) return;
    translationInFlightRef.current.add(tKey);

    try {
      // Check Firestore translations subcollection first (shared with mobile)
      const translationsRef = collection(db, "conversations", conversationId, "messages", msg.id, "translations");
      const q = query(translationsRef, where("language", "==", myLang), limit(1));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const transData = snap.docs[0].data();
        if (transData?.content) {
          globalTranslationCache[tKey] = transData.content;
          saveTranslationToStorage(conversationId, myLang, msg.id, transData.content);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msg.id
                ? { ...m, translated_content: transData.content, is_translated: true, is_translation_loading: false }
                : m
            )
          );
          return;
        }
      }

      // Mark loading
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_translation_loading: true } : m))
      );

      // Call translation
      const senderProfile = participantProfilesRef.current[msg.sender_id] || profileCache[msg.sender_id];
      const translated = await translateText(msg.content, myLang, {
        sourceLanguage: senderProfile?.native_language,
        conversationType: activeConversation?.type === "group" ? "group" : "direct",
        targetSpeaker: senderProfile?.username || msg.sender_name || "Participant",
        replyTo: msg.reply_to
          ? {
              speaker: msg.reply_to.sender_name || "User",
              content: msg.reply_to.content,
            }
          : undefined,
      });

      if (translated && !isSameLanguageOrIdentical(translated, msg.content)) {
        globalTranslationCache[tKey] = translated;
        saveTranslationToStorage(conversationId, myLang, msg.id, translated);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id
              ? {
                  ...m,
                  translated_content: translated,
                  is_translated: true,
                  is_translation_loading: false,
                }
              : m
          )
        );

        // Save to Firestore subcollection so both web & mobile benefit (idempotent with merge: true)
        try {
          const existingSnap = await getDocs(
            query(translationsRef, where("language", "==", myLang), limit(1))
          );
          if (!existingSnap.empty) {
            await setDoc(
              existingSnap.docs[0].ref,
              { language: myLang, content: translated, updated_at: serverTimestamp() },
              { merge: true }
            );
          } else {
            const langDocId = myLang.toLowerCase().replace(/[^a-z0-9]/g, "_") || "trans";
            await setDoc(
              doc(translationsRef, langDocId),
              { language: myLang, content: translated, created_at: serverTimestamp() },
              { merge: true }
            );
          }
        } catch (subErr) {
          console.debug("[Translation] Could not persist to translations subcollection:", subErr);
        }
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, is_translation_loading: false } : m))
        );
      }
    } catch (err) {
      console.warn("[Translation] Error during translation hydration:", err);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_translation_loading: false } : m))
      );
    } finally {
      translationInFlightRef.current.delete(tKey);
    }
  };

  // Load cached translations from localStorage on chat change
  useEffect(() => {
    if (!activeConversationId || typeof window === "undefined") return;
    const myLang = profile?.native_language || "English";
    try {
      const raw = localStorage.getItem(`gabvia_web_translations_${activeConversationId}_${myLang}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.assign(globalTranslationCache, parsed);
        setMessages((prev) =>
          prev.map((m) => {
            const cached = parsed[m.id];
            if (cached && !m.translated_content) {
              return { ...m, translated_content: cached, is_translated: true, is_translation_loading: false };
            }
            return m;
          })
        );
      }
    } catch {}
  }, [activeConversationId, profile?.native_language]);

  // Re-hydrate messages when user switches their language
  useEffect(() => {
    if (!activeConversationId || !user) return;
    const myLang = profile?.native_language || "English";
    messages.forEach((m) => {
      if (m.sender_id !== user.uid && m.content) {
        hydrateTranslationForMessage(m, activeConversationId, myLang);
      }
    });
  }, [profile?.native_language]);

  useEffect(() => {
    if (!user || !activeConversationId) return;

    const q = query(
      collection(db, "conversations", activeConversationId, "messages"),
      orderBy("created_at", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const myLang = profileRef.current?.native_language || "English";
        const parsedMessages: Message[] = snapshot.docs
          .filter((docSnap) => {
            const data = docSnap.data();
            if (data.deleted_for && Array.isArray(data.deleted_for) && data.deleted_for.includes(user.uid)) {
              return false;
            }
            return true;
          })
          .map((docSnap) => {
            const data = docSnap.data();
            let plainContent = data.content;
            let isE2EE = false;
            let decryptionFailed = false;

            // Check for E2EE Direct Message Payload
            if (data.type === "text" && plainContent && plainContent.startsWith("{")) {
              try {
                const payload = JSON.parse(plainContent);
                if (payload.senderContent || payload.recipientContent) {
                  isE2EE = true;
                  if (keyPair) {
                    if (data.sender_id === user.uid) {
                      const decrypted = decryptMessage(
                        payload.senderContent,
                        payload.senderNonce,
                        keyPair.publicKeyBase64,
                        keyPair.privateKeyUint8
                      );
                      plainContent = decrypted || "🔒 Decryption failed";
                      if (!decrypted) decryptionFailed = true;
                    } else {
                      const senderProfile = participantProfilesRef.current[data.sender_id] || profileCache[data.sender_id];
                      if (senderProfile?.public_key) {
                        const decrypted = decryptMessage(
                          payload.recipientContent,
                          payload.recipientNonce,
                          senderProfile.public_key,
                          keyPair.privateKeyUint8
                        );
                        plainContent = decrypted || "🔒 Decryption failed";
                        if (!decrypted) decryptionFailed = true;
                      } else {
                        plainContent = "🔒 Encrypted Message (Keys missing)";
                        decryptionFailed = true;
                      }
                    }
                  } else {
                    plainContent = "🔒 Encrypted Message (Keys not loaded)";
                    decryptionFailed = true;
                  }
                }
              } catch {
                // Not JSON, display plain content
              }
            }

            const createdAtStr = data.created_at?.toDate
              ? data.created_at.toDate().toISOString()
              : (data.created_at || new Date().toISOString());

            const senderName =
              participantProfilesRef.current[data.sender_id]?.username ||
              profileCache[data.sender_id]?.username ||
              "User";

            const tKey = `${activeConversationId}:${docSnap.id}:${myLang}`;
            const cachedTranslation = globalTranslationCache[tKey] || data.translated_content;

            return {
              id: docSnap.id,
              sender_id: data.sender_id,
              content: plainContent,
              type: data.type || "text",
              audio_url: data.audio_url || null,
              duration: data.duration,
              status: data.status || "delivered",
              client_id: data.client_id,
              created_at: createdAtStr,
              translated_content: cachedTranslation,
              is_translated: Boolean(cachedTranslation),
              sender_name: senderName,
              reply_to: data.reply_to || null,
              is_e2ee: isE2EE,
              decryption_failed: decryptionFailed,
              is_edited: Boolean(data.is_edited),
              event_id: data.event_id,
              event_data: data.event_data,
              deleted_for: data.deleted_for || [],
            };
          });

        // Messages arrive desc, reverse to chronological asc
        const chronological = parsedMessages.reverse();
        setMessages(chronological);
        setLoadingMessages(false);

        // Automatically hydrate cross-language translations in background
        chronological.forEach((m) => {
          if (!m.translated_content && m.sender_id !== user.uid && m.content) {
            hydrateTranslationForMessage(m, activeConversationId, myLang);
          }
        });
      },
      (error) => {
        console.error("Messages snapshot error:", error);
        setLoadingMessages(false);
      }
    );

    return () => unsubscribe();
  }, [user, activeConversationId, keyPair]);

  // Check if conversation participants speak a different language
  const checkRequiresCrossLanguageTranslation = async (): Promise<boolean> => {
    if (!activeConversation) return false;
    const myLang = profileRef.current?.native_language || profile?.native_language;
    if (!myLang || !activeConversation.participants) return false;

    const otherParticipants = activeConversation.participants.filter((pId) => pId !== user?.uid);
    if (otherParticipants.length === 0) return false;

    for (const pId of otherParticipants) {
      let otherProfile = participantProfilesRef.current[pId] || profileCache[pId];
      if (!otherProfile) {
        try {
          const snap = await getDoc(doc(db, "profiles", pId));
          if (snap.exists()) {
            otherProfile = { ...snap.data(), id: snap.id } as Profile;
            profileCache[pId] = otherProfile;
            participantProfilesRef.current[pId] = otherProfile;
          }
        } catch {
          // ignore profile lookup failure
        }
      }
      if (otherProfile?.native_language && otherProfile.native_language !== myLang) {
        return true;
      }
    }
    return false;
  };

  // 5. Send message with E2EE
  const sendMessage = async (rawContent: string) => {
    if (!user || !activeConversationId || !activeConversation) return;

    const validation = validateMessage(rawContent);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Cross-Language Point Deduction
    const requiresTranslation = await checkRequiresCrossLanguageTranslation();
    if (requiresTranslation) {
      const currentPoints = profileRef.current?.gab_points ?? profile?.gab_points ?? 0;
      if (currentPoints < 1) {
        throw new Error("INSUFFICIENT_GAB_POINTS");
      }
      await deductPoints(1);
    }

    const content = validation.sanitized;
    let finalContent = content;
    const isDirect = activeConversation.type === "direct" || activeConversation.type === "individual";

    // Direct Chat E2EE Encryption
    if (isDirect && keyPair) {
      const otherId = activeConversation.participants.find((id) => id !== user.uid);
      const otherProfile = otherId ? (participantProfilesRef.current[otherId] || profileCache[otherId]) : null;

      if (otherProfile?.public_key) {
        const recipientEncrypted = encryptMessage(content, otherProfile.public_key, keyPair.privateKeyUint8);
        const senderEncrypted = encryptMessage(content, keyPair.publicKeyBase64, keyPair.privateKeyUint8);

        finalContent = JSON.stringify({
          senderContent: senderEncrypted.cipherText,
          senderNonce: senderEncrypted.nonce,
          recipientContent: recipientEncrypted.cipherText,
          recipientNonce: recipientEncrypted.nonce,
        });
      }
    }

    const tempId = `temp-${Date.now()}`;
    const messageDocData: DocumentData = {
      sender_id: user.uid,
      client_id: tempId,
      content: finalContent,
      type: "text",
      status: "delivered",
      created_at: serverTimestamp(),
    };

    if (replyTo) {
      messageDocData.reply_to = {
        id: replyTo.id,
        content: replyTo.content || "",
        sender_id: replyTo.sender_id,
        sender_name: replyTo.sender_name || "User",
      };
    }

    const convoRef = doc(db, "conversations", activeConversationId);
    const messagesCollection = collection(convoRef, "messages");

    const newDoc = await addDoc(messagesCollection, messageDocData);

    // Update conversation metadata & unread counters
    const otherParticipants = activeConversation.participants.filter((p) => p !== user.uid);
    const unreadUpdate: Record<string, unknown> = {
      last_message: content,
      last_message_at: serverTimestamp(),
      last_message_id: newDoc.id,
    };

    otherParticipants.forEach((pId) => {
      unreadUpdate[`unread_count.${pId}`] = increment(1);
    });

    await updateDoc(convoRef, unreadUpdate);
    setReplyTo(null);
    awardMilestonePoints(user.uid, "first_message").catch(() => {});

    // 5b. Dispatch push notifications to other participants
    void (async () => {
      try {
        const pushItems: PushNotificationItem[] = [];
        const senderName =
          profileRef.current?.full_name ||
          profileRef.current?.username ||
          profile?.username ||
          "Gabvia User";
        const notifTitle =
          activeConversation.type === "group"
            ? `${activeConversation.name || "Group"}: ${senderName}`
            : `New message from ${senderName}`;
        const notifBody = isDirect
          ? "Sent a secure message 🔒"
          : content.length > 100
          ? `${content.slice(0, 97)}...`
          : content;

        for (const pId of otherParticipants) {
          let pushToken = participantProfilesRef.current[pId]?.expo_push_token;
          if (!pushToken) {
            try {
              const pSnap = await getDoc(doc(db, "profiles", pId));
              if (pSnap.exists()) {
                const pData = pSnap.data() as Profile;
                pushToken = pData?.expo_push_token;
                if (pData) {
                  participantProfilesRef.current[pId] = {
                    ...participantProfilesRef.current[pId],
                    ...pData,
                  };
                }
              }
            } catch (fetchErr) {
              console.warn("[Push] Could not fetch recipient profile for push:", fetchErr);
            }
          }

          if (
            pushToken &&
            (pushToken.startsWith("ExponentPushToken[") || pushToken.startsWith("ExpoPushToken["))
          ) {
            pushItems.push({
              to: pushToken,
              sound: "default",
              channelId: "default",
              title: notifTitle,
              body: notifBody,
              data: { conversationId: activeConversationId },
            });
          }
        }

        if (pushItems.length > 0) {
          await sendPushNotifications(pushItems);
        }
      } catch (pushErr) {
        console.warn("[Push] Background push dispatch error:", pushErr);
      }
    })();
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!user || !activeConversationId) return;
    const trimmed = newContent.trim();
    if (!trimmed) return;

    const existingMsg = messages.find((m) => m.id === messageId);
    if (!existingMsg) return;
    if (existingMsg.sender_id !== user.uid) {
      throw new Error("You can only edit your own messages.");
    }
    if (existingMsg.content === trimmed) return;

    let finalContent = trimmed;

    // Encrypt if direct chat
    if (activeConversation?.type === "direct" && keyPair) {
      const otherId = activeConversation.participants.find((id) => id !== user.uid);
      const otherProfile = otherId ? (participantProfilesRef.current[otherId] || profileCache[otherId]) : null;
      if (otherProfile?.public_key) {
        const recipientEncrypted = encryptMessage(trimmed, otherProfile.public_key, keyPair.privateKeyUint8);
        const senderEncrypted = encryptMessage(trimmed, keyPair.publicKeyBase64, keyPair.privateKeyUint8);

        finalContent = JSON.stringify({
          senderContent: senderEncrypted.cipherText,
          senderNonce: senderEncrypted.nonce,
          recipientContent: recipientEncrypted.cipherText,
          recipientNonce: recipientEncrypted.nonce,
        });
      }
    }

    // Optimistic local state update
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              content: trimmed,
              is_edited: true,
              is_translated: false,
              translated_content: undefined,
            }
          : m
      )
    );

    const messageRef = doc(db, "conversations", activeConversationId, "messages", messageId);
    await updateDoc(messageRef, {
      content: finalContent,
      is_edited: true,
      updated_at: serverTimestamp(),
    });

    // Invalidate old translations for this message in Firestore subcollection
    try {
      const translationsRef = collection(db, "conversations", activeConversationId, "messages", messageId, "translations");
      const transSnap = await getDocs(translationsRef);
      await Promise.allSettled(transSnap.docs.map((d) => deleteDoc(d.ref)));
    } catch {}
  };

  const deleteMessage = async (messageId: string, mode: "everyone" | "for_me" = "everyone") => {
    if (!user || !activeConversationId) return;

    const msg = messages.find((m) => m.id === messageId);
    const isAdmin = activeConversation?.admin_id === user.uid;

    if (mode === "everyone" && msg && msg.sender_id !== user.uid && !isAdmin) {
      throw new Error("You can only delete your own messages for everyone.");
    }

    // Optimistic local update
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    const messageRef = doc(db, "conversations", activeConversationId, "messages", messageId);

    if (mode === "for_me") {
      await updateDoc(messageRef, {
        deleted_for: arrayUnion(user.uid),
      });
    } else {
      await deleteDoc(messageRef);

      // Clean up translations subcollection if exists
      try {
        const transRef = collection(db, "conversations", activeConversationId, "messages", messageId, "translations");
        const transSnap = await getDocs(transRef);
        await Promise.allSettled(transSnap.docs.map((d) => deleteDoc(d.ref)));
      } catch {}

      // Check if conversation last_message needs updating
      const convRef = doc(db, "conversations", activeConversationId);
      const convSnap = await getDoc(convRef);
      if (convSnap.exists() && convSnap.data().last_message_id === messageId) {
        const remainingQuery = query(
          collection(db, "conversations", activeConversationId, "messages"),
          orderBy("created_at", "desc"),
          limit(1)
        );
        const remainingSnap = await getDocs(remainingQuery);

        if (!remainingSnap.empty) {
          const nextDoc = remainingSnap.docs[0];
          const nextData = nextDoc.data();
          let displayContent = nextData.type === "text" ? nextData.content : "Voice note";
          if (nextData.type === "text" && displayContent && displayContent.startsWith("{")) {
            try {
              const payload = JSON.parse(displayContent);
              if (payload.senderContent || payload.recipientContent) {
                displayContent = "Encrypted message";
              }
            } catch {}
          }
          await updateDoc(convRef, {
            last_message: displayContent || "Message",
            last_message_at: nextData.created_at || serverTimestamp(),
            last_message_id: nextDoc.id,
          });
        } else {
          await updateDoc(convRef, {
            last_message: "No messages yet",
            last_message_at: serverTimestamp(),
            last_message_id: null,
          });
        }
      }
    }
  };

  // 6. Start or find a direct conversation with a target user
  const startDirectChat = async (targetUserId: string): Promise<string> => {
    if (!user) throw new Error("User must be signed in.");
    if (targetUserId === user.uid) throw new Error("You cannot chat with yourself.");

    // Check existing conversation
    const q1 = query(
      collection(db, "conversations"),
      where("type", "in", ["direct", "individual"]),
      where("participants", "array-contains", user.uid)
    );
    const snap = await getDocs(q1);
    const existing = snap.docs.find((d) => (d.data().participants as string[])?.includes(targetUserId));

    if (existing) {
      setActiveConversationId(existing.id);
      return existing.id;
    }

    // Create fresh conversation
    const newConvoRef = await addDoc(collection(db, "conversations"), {
      type: "direct",
      participants: [user.uid, targetUserId],
      created_at: serverTimestamp(),
      last_message_at: serverTimestamp(),
      unread_count: { [user.uid]: 0, [targetUserId]: 0 },
    });

    setActiveConversationId(newConvoRef.id);
    return newConvoRef.id;
  };

  // 7. Search users securely by username or email
  const searchUsers = useCallback(async (searchTerm: string): Promise<Profile[]> => {
    const cleaned = searchTerm.trim().toLowerCase().replace(/^@/, "").replace(/\s+/g, "");
    if (!cleaned || cleaned.length < 2) return [];

    const profilesRef = collection(db, "profiles");
    const results: Profile[] = [];
    const seenIds = new Set<string>();

    try {
      const queries = [
        query(
          profilesRef,
          where("username_lower", ">=", cleaned),
          where("username_lower", "<=", cleaned + "\uf8ff"),
          limit(15)
        ),
      ];

      // Exact email lookup if input looks like an email
      if (cleaned.includes("@")) {
        queries.push(query(profilesRef, where("email", "==", cleaned), limit(5)));
      }

      // Prefix queries on "username" in case username_lower is not yet set (legacy profiles)
      const c0 = cleaned[0];
      const c1 = cleaned[1];
      const prefixes = [
        c0.toUpperCase() + c1.toLowerCase(),
        c0.toUpperCase() + c1.toUpperCase(),
        c0.toLowerCase() + c1.toLowerCase(),
      ];
      for (const p of prefixes) {
        queries.push(
          query(
            profilesRef,
            where("username", ">=", p),
            where("username", "<=", p + "\uf8ff"),
            limit(10)
          )
        );
      }

      const snaps = await Promise.allSettled(queries.map((q) => getDocs(q)));
      for (const snapRes of snaps) {
        if (snapRes.status === "fulfilled") {
          snapRes.value.docs.forEach((d) => {
            if (d.id !== user?.uid && !seenIds.has(d.id)) {
              const data = d.data();
              const u = (data.username || "").toLowerCase();
              const ul = (data.username_lower || "").toLowerCase();
              const em = (data.email || "").toLowerCase();
              if (u.includes(cleaned) || ul.includes(cleaned) || em.includes(cleaned)) {
                seenIds.add(d.id);
                const prof = { ...data, id: d.id } as Profile;
                profileCache[d.id] = prof;
                results.push(prof);
              }
            }
          });
        }
      }
    } catch (err) {
      console.error("[WebChat] searchUsers error:", err);
    }

    return results;
  }, [user]);

  // 8. Group Invitations & Group Management
  const [invitations, setInvitations] = useState<ConversationWithDetails[]>([]);

  useEffect(() => {
    if (!user) {
      setInvitations([]);
      return;
    }

    const q = query(
      collection(db, "conversations"),
      where("pending_participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const list: ConversationWithDetails[] = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let adminProfile: Profile | null = null;
            if (data.admin_id) {
              if (profileCache[data.admin_id]) {
                adminProfile = profileCache[data.admin_id];
              } else {
                try {
                  const pSnap = await getDoc(doc(db, "profiles", data.admin_id));
                  if (pSnap.exists()) {
                    adminProfile = { ...pSnap.data(), id: pSnap.id } as Profile;
                    profileCache[data.admin_id] = adminProfile;
                  }
                } catch {}
              }
            }

            return {
              id: docSnap.id,
              type: data.type || "group",
              name: data.name || "Group Chat",
              admin_id: data.admin_id,
              participants: data.participants || [],
              pending_participants: data.pending_participants || [],
              other_user: adminProfile,
              last_message: data.last_message || "",
              last_message_at: data.last_message_at?.toDate
                ? data.last_message_at.toDate().toISOString()
                : (data.last_message_at || ""),
              unread_count: data.unread_count || {},
            };
          })
        );

        list.sort((a, b) => {
          const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return tB - tA;
        });

        setInvitations(list);
      },
      (error) => {
        console.warn("[WebChat] Invitations listener warning:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const acceptInvite = async (conversationId: string) => {
    if (!user) return;
    try {
      const convoRef = doc(db, "conversations", conversationId);
      await updateDoc(convoRef, {
        participants: arrayUnion(user.uid),
        pending_participants: arrayRemove(user.uid),
      });
      setActiveConversationId(conversationId);
      awardMilestonePoints(user.uid, "group_join_or_create").catch(() => {});
    } catch (error) {
      console.error("[WebChat] Error accepting invite:", error);
      throw error;
    }
  };

  const declineInvite = async (conversationId: string) => {
    if (!user) return;
    try {
      const convoRef = doc(db, "conversations", conversationId);
      await updateDoc(convoRef, {
        pending_participants: arrayRemove(user.uid),
      });
    } catch (error) {
      console.error("[WebChat] Error declining invite:", error);
      throw error;
    }
  };

  const createGroup = async (name: string, participantIds: string[]): Promise<string> => {
    if (!user) throw new Error("User must be signed in.");
    if (!name.trim()) throw new Error("Group name is required.");

    const convoData = {
      type: "group",
      name: name.trim(),
      admin_id: user.uid,
      participants: [user.uid],
      pending_participants: participantIds,
      last_message: "Group created",
      last_message_at: serverTimestamp(),
      created_at: serverTimestamp(),
      unread_count: {
        [user.uid]: 0,
      },
    };

    const convoRef = await addDoc(collection(db, "conversations"), convoData);
    setActiveConversationId(convoRef.id);
    awardMilestonePoints(user.uid, "group_join_or_create").catch(() => {});
    return convoRef.id;
  };

  const inviteMembers = async (conversationId: string, participantIds: string[]) => {
    if (!user) throw new Error("User must be signed in.");
    if (!participantIds.length) return;
    const convoRef = doc(db, "conversations", conversationId);
    await updateDoc(convoRef, {
      pending_participants: arrayUnion(...participantIds),
    });
  };

  const removeMember = async (conversationId: string, memberId: string) => {
    if (!user) throw new Error("User must be signed in.");
    const convoRef = doc(db, "conversations", conversationId);
    const convoSnap = await getDoc(convoRef);
    if (!convoSnap.exists()) throw new Error("Conversation not found.");
    const data = convoSnap.data();
    if (data.admin_id !== user.uid) {
      throw new Error("Only the group owner can remove members.");
    }
    await updateDoc(convoRef, {
      participants: arrayRemove(memberId),
      [`unread_count.${memberId}`]: deleteField(),
    });
  };

  const deleteGroup = async (conversationId: string) => {
    if (!user) throw new Error("User must be signed in.");
    try {
      const convoRef = doc(db, "conversations", conversationId);
      const convoSnap = await getDoc(convoRef);
      if (!convoSnap.exists()) throw new Error("Conversation not found.");

      const data = convoSnap.data();
      if (data.admin_id !== user.uid) {
        throw new Error("Only the group owner can delete the group.");
      }

      await deleteDoc(convoRef);

      // If active conversation was this group, deselect it cleanly
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
    } catch (error) {
      console.error("[WebChat] Error deleting group:", error);
      throw error;
    }
  };

  const scheduleEvent = async (
    conversationId: string,
    eventData: { title: string; description: string; date: string }
  ) => {
    if (!user) throw new Error("User must be signed in.");
    if (!eventData.title.trim()) throw new Error("Event title is required.");
    if (!eventData.date) throw new Error("Event date is required.");

    const convoRef = doc(db, "conversations", conversationId);
    const eventRef = doc(collection(db, "conversations", conversationId, "events"));
    const messageRef = doc(collection(convoRef, "messages"));

    const eventId = eventRef.id;
    const messageId = messageRef.id;

    const newEventDoc = {
      ...eventData,
      created_by: user.uid,
      created_at: serverTimestamp(),
      message_id: messageId,
    };

    const messageData = {
      sender_id: user.uid,
      type: "event",
      event_id: eventId,
      event_data: {
        id: eventId,
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        created_by: user.uid,
        status: "active",
      },
      content: `📅 New Event: ${eventData.title}`,
      created_at: serverTimestamp(),
    };

    const convoUpdatePayload = {
      pinned_event: {
        id: eventId,
        ...eventData,
        created_by: user.uid,
      },
      last_message: `📅 Event: ${eventData.title}`,
      last_message_at: serverTimestamp(),
    };

    await Promise.all([
      setDoc(eventRef, newEventDoc),
      setDoc(messageRef, messageData),
      updateDoc(convoRef, convoUpdatePayload),
    ]);

    return eventId;
  };

  const clearPinnedEvent = async (conversationId: string) => {
    if (!user) return;
    const convoRef = doc(db, "conversations", conversationId);
    await updateDoc(convoRef, {
      pinned_event: deleteField(),
    });
  };

  const updateEvent = async (
    conversationId: string,
    eventId: string,
    eventData: { title: string; description: string; date: string }
  ) => {
    if (!user) throw new Error("User must be signed in.");
    if (!eventData.title.trim()) throw new Error("Event title is required.");
    if (!eventData.date) throw new Error("Event date is required.");

    const eventRef = doc(db, "conversations", conversationId, "events", eventId);
    const convoRef = doc(db, "conversations", conversationId);

    const [eventSnap, convoSnap] = await Promise.all([
      getDoc(eventRef),
      getDoc(convoRef),
    ]);

    if (!eventSnap.exists()) throw new Error("Event not found.");

    const event = eventSnap.data();
    const isAdmin = convoSnap.exists() && convoSnap.data().admin_id === user.uid;

    if (event.created_by !== user.uid && !isAdmin) {
      throw new Error("Only the event creator or group owner can edit this event.");
    }

    let messageDocId = event.message_id;
    if (!messageDocId) {
      const q = query(
        collection(convoRef, "messages"),
        where("event_id", "==", eventId),
        limit(1)
      );
      const msgSnap = await getDocs(q);
      if (!msgSnap.empty) {
        messageDocId = msgSnap.docs[0].id;
      }
    }

    const convoUpdatePayload: any = {
      last_message: `📅 Updated Event: ${eventData.title}`,
      last_message_at: serverTimestamp(),
    };
    if (convoSnap.exists() && convoSnap.data().pinned_event?.id === eventId) {
      convoUpdatePayload.pinned_event = {
        id: eventId,
        ...eventData,
        created_by: event.created_by || user.uid,
      };
    }

    const writePromises: Promise<any>[] = [
      updateDoc(eventRef, { ...eventData, updated_at: serverTimestamp() }),
      updateDoc(convoRef, convoUpdatePayload),
    ];

    if (messageDocId) {
      const msgRef = doc(convoRef, "messages", messageDocId);
      writePromises.push(
        updateDoc(msgRef, {
          content: `📅 Updated Event: ${eventData.title}`,
          "event_data.title": eventData.title,
          "event_data.description": eventData.description,
          "event_data.date": eventData.date,
          "event_data.status": "active",
          is_edited: true,
          updated_at: serverTimestamp(),
        })
      );
    }

    await Promise.all(writePromises);
  };

  const deleteEvent = async (conversationId: string, eventId: string) => {
    if (!user) throw new Error("User must be signed in.");

    const eventRef = doc(db, "conversations", conversationId, "events", eventId);
    const convoRef = doc(db, "conversations", conversationId);

    const [eventSnap, convoSnap] = await Promise.all([
      getDoc(eventRef),
      getDoc(convoRef),
    ]);

    if (!eventSnap.exists()) throw new Error("Event not found.");

    const event = eventSnap.data();
    const isAdmin = convoSnap.exists() && convoSnap.data().admin_id === user.uid;

    if (event.created_by !== user.uid && !isAdmin) {
      throw new Error("Only the event creator or group owner can delete this event.");
    }

    let messageDocId = event.message_id;
    if (!messageDocId) {
      const q = query(
        collection(convoRef, "messages"),
        where("event_id", "==", eventId),
        limit(1)
      );
      const msgSnap = await getDocs(q);
      if (!msgSnap.empty) {
        messageDocId = msgSnap.docs[0].id;
      }
    }

    const convoUpdatePayload: any = {
      last_message: `❌ Event Cancelled: ${event.title || "Event"}`,
      last_message_at: serverTimestamp(),
    };
    if (convoSnap.exists() && convoSnap.data().pinned_event?.id === eventId) {
      convoUpdatePayload.pinned_event = deleteField();
    }

    const writePromises: Promise<any>[] = [
      deleteDoc(eventRef),
      updateDoc(convoRef, convoUpdatePayload),
    ];

    if (messageDocId) {
      const msgRef = doc(convoRef, "messages", messageDocId);
      writePromises.push(
        updateDoc(msgRef, {
          content: `❌ Event Cancelled: ${event.title || "Event"}`,
          "event_data.status": "cancelled",
          is_edited: true,
          updated_at: serverTimestamp(),
        })
      );
    }

    await Promise.all(writePromises);
  };

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    messages,
    loadingConversations,
    loadingMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    startDirectChat,
    createGroup,
    inviteMembers,
    removeMember,
    deleteGroup,
    scheduleEvent,
    updateEvent,
    deleteEvent,
    clearPinnedEvent,
    invitations,
    acceptInvite,
    declineInvite,
    searchUsers,
    replyTo,
    setReplyTo,
    activeParticipantProfiles,
  };
}
