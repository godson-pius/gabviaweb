"use client";

import React, { Suspense } from "react";
import SimplifiedOnboarding from "@/components/auth/SimplifiedOnboarding";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
        </div>
      }
    >
      <SimplifiedOnboarding />
    </Suspense>
  );
}
