import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started | Gabvia",
  description:
    "Join Gabvia to start communicating seamlessly across 40+ languages with instant real-time AI translation and end-to-end encryption.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

