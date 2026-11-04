import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gabvia Web Chat — Real-Time Multilingual Communication",
  description:
    "Direct in-browser multilingual messaging and voice translation. Communicate across 40+ languages with end-to-end encryption on Gabvia.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}

