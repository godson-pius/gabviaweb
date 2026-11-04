import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In | Gabvia",
  description:
    "Sign in to your Gabvia account to access real-time multilingual messaging, voice translation, and contacts.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

