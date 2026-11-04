import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | Gabvia",
  description:
    "Sign up for Gabvia to experience seamless real-time multilingual communication and private end-to-end encrypted messaging.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}

