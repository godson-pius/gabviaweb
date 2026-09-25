import { db } from "@/lib/firebase";
import { doc, runTransaction } from "firebase/firestore";

export const EARLY_ADOPTER_LIMIT = 1000;
export const EARLY_ADOPTER_PLAN = "early_1000";
export const STANDARD_PLAN = "standard_500";
export const STANDARD_INVITE_POINTS = 20;

export const MILESTONE_POINTS = {
  signup_bonus: 500,
  backup_pin: 100,
  first_message: 100,
  group_join_or_create: 100,
  invite_friend: 200,
} as const;

export type MilestoneKey = keyof typeof MILESTONE_POINTS;
export const ALL_MILESTONES = Object.keys(MILESTONE_POINTS) as MilestoneKey[];

export const MILESTONE_LABELS: Record<MilestoneKey, { title: string; desc: string; points: number }> = {
  signup_bonus: {
    title: "Welcome Bonus",
    desc: "Granted upon early registration",
    points: 500,
  },
  backup_pin: {
    title: "E2EE Backup PIN",
    desc: "Secure keys with zero-knowledge backup",
    points: 100,
  },
  first_message: {
    title: "Send First Message",
    desc: "Start a multilingual or encrypted conversation",
    points: 100,
  },
  group_join_or_create: {
    title: "Group Milestone",
    desc: "Create or accept an invite to a group",
    points: 100,
  },
  invite_friend: {
    title: "Invite a Friend",
    desc: "Share your referral code with a peer",
    points: 200,
  },
};

export const awardMilestonePoints = async (
  userUid: string,
  milestone: MilestoneKey
): Promise<boolean> => {
  try {
    const success = await runTransaction(db, async (tx) => {
      const profileRef = doc(db, "profiles", userUid);
      const profileSnap = await tx.get(profileRef);

      if (!profileSnap.exists()) return false;

      const data = profileSnap.data() as any;
      if (data.bonus_plan && data.bonus_plan !== EARLY_ADOPTER_PLAN) return false;

      const claims = data.bonus_claims || {};
      if (claims[milestone]) return false;

      const currentPoints = typeof data.gab_points === "number" ? data.gab_points : 0;
      const rewardPoints = MILESTONE_POINTS[milestone];
      const allMilestonesClaimed = ALL_MILESTONES.every(
        (key) => claims[key] || key === milestone
      );

      const updateData: Record<string, any> = {
        gab_points: currentPoints + rewardPoints,
        [`bonus_claims.${milestone}`]: true,
        updated_at: new Date().toISOString(),
      };

      if (allMilestonesClaimed && !data.milestone_campaign_completed_at) {
        updateData.milestone_campaign_completed_at = new Date().toISOString();
      }

      tx.update(profileRef, updateData);
      return true;
    });

    if (success && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("milestoneAwarded", {
          detail: { milestone, points: MILESTONE_POINTS[milestone] },
        })
      );
    }

    return success;
  } catch (error) {
    console.error(`Failed to award milestone ${milestone}:`, error);
    return false;
  }
};
