import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell, TocItem } from "@/components/legal/LegalPageShell";
import { Smartphone, AlertTriangle, ShieldCheck, Mail, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Delete Your Gabvia Account",
  description: "Learn how to delete your Gabvia account from the mobile app or contact Gabvia support for help.",
  alternates: { canonical: "/delete-account" },
};

const TOC: TocItem[] = [
  { id: "in-app", label: "1. Delete in Mobile App" },
  { id: "before-you-delete", label: "2. What Gets Deleted" },
  { id: "retention-rules", label: "3. Retention & Encryption Keys" },
  { id: "need-help", label: "4. Need Help or Manual Request" },
];

export default function DeleteAccountPage() {
  return (
    <LegalPageShell
      current="delete-account"
      eyebrow="Account Management"
      title="Ready to leave? You are always in control."
      lead="You can delete your Gabvia account directly from the mobile app at any time. The option is located in the Settings screen so you always maintain full ownership and control over your presence and personal data."
      meta={[
        "Self-serve via Mobile App",
        "Permanent & Irreversible",
        "GDPR & Rwanda Law Compliant",
      ]}
      notice={{
        tag: "Important Warning",
        text: "Account deletion is permanent and cannot be undone. Simply deleting or uninstalling the app from your device does NOT delete your Gabvia account or revoke cryptographic credentials.",
        variant: "warning",
      }}
      toc={TOC}
      asideCopy="Clear, straightforward instructions for permanently deleting your account, profile, and associated keys."
    >
      <section id="in-app">
        <h2>1. Delete your account in the mobile app</h2>
        <p>
          The fastest and most secure way to delete your account is through the Gabvia iOS or Android mobile application:
        </p>

        <div className="grid gap-3 my-6 not-prose">
          {[
            {
              step: "1",
              title: "Open Settings",
              desc: "Launch Gabvia on your device, navigate to the main screen, and tap your profile avatar or the Settings gear icon.",
            },
            {
              step: "2",
              title: "Scroll to Actions",
              desc: "Scroll down to the bottom of the Settings screen where account management and danger zone controls are located.",
            },
            {
              step: "3",
              title: "Select Delete Account",
              desc: "Tap the red 'Delete account' action. For security, you may be prompted to re-authenticate with your PIN or password.",
            },
            {
              step: "4",
              title: "Confirm Permanent Deletion",
              desc: "Carefully read the warning dialog detailing the permanent loss of messages and keys, then tap 'Delete' to finalize.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-4 p-4 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-white/5 dark:bg-white/5 light:bg-slate-50 transition-all"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-bold text-sm shadow-md">
                {item.step}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white m-0">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 m-0 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p>
          Once confirmed, Gabvia immediately invalidates your active session, purges your public profile from directory searches, and initiates cryptographic key revocation across our relay cluster.
        </p>
      </section>

      <section id="before-you-delete">
        <h2>2. What happens to your data when you delete</h2>
        <p>
          Before initiating account deletion, ensure you have exported or saved any important conversation records or media files you wish to keep:
        </p>
        <ul>
          <li>
            <strong>Profile & Identity:</strong> Your display name, username, bio, phone number, and avatar are permanently removed.
          </li>
          <li>
            <strong>End-to-End Encryption Keys:</strong> Your public pre-keys and cryptographic identities are deleted from the server. Once deleted, nobody can send you encrypted messages.
          </li>
          <li>
            <strong>Device Message Stores:</strong> Local chats stored on your physical device remain on your device until you uninstall the app or clear app data.
          </li>
          <li>
            <strong>GAB POINTS:</strong> Any remaining or unused GAB POINTS balance will be forfeited and cannot be transferred or refunded, except where mandated by applicable consumer protection laws.
          </li>
        </ul>
        <p>
          For more details on data handling during deletion cycles, review our{" "}
          <Link href="/privacy#retention" className="text-cyan-400 hover:underline">
            Privacy Policy Retention & Deletion Schedule
          </Link>
          .
        </p>
      </section>

      <section id="retention-rules">
        <h2>3. Data retention and legal obligations</h2>
        <p>
          While active user records and identifiers are deleted immediately upon confirmation, certain minimal records may be retained in secure, access-controlled audit archives to comply with statutory legal, tax, and anti-fraud regulations:
        </p>
        <ul>
          <li>
            Financial receipts and transaction hashes for GAB POINTS purchases processed through RevenueCat, Apple, or Google are retained for statutory accounting periods.
          </li>
          <li>
            Abuse prevention logs (such as hashes of banned bad actors or spam rings) may be kept to prevent platform exploitation.
          </li>
        </ul>
      </section>

      <section id="need-help">
        <h2>4. Cannot access the app or need manual deletion?</h2>
        <p>
          If you have lost access to your device, cannot log into your account, or encounter any error while attempting to delete your account, our support team can process a manual deletion request for you.
        </p>

        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 via-blue-950/20 to-transparent p-6 mt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Mail className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white m-0">
                Contact Support for Manual Deletion
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 m-0 leading-relaxed">
                Please email us from the email address registered to your Gabvia account. Include your account handle/phone number and state that you are requesting permanent account termination.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href="mailto:officialgabvia@gmail.com?subject=Account%20Deletion%20Request"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm shadow-md hover:brightness-110 transition-all"
                >
                  <Mail className="h-4 w-4" />
                  Email officialgabvia@gmail.com
                </a>
                <a
                  href="mailto:legal@gabvia.app?subject=Account%20Deletion%20Inquiry"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 dark:border-white/10 light:border-slate-300 bg-white/5 dark:bg-white/5 light:bg-slate-100 text-slate-900 dark:text-slate-200 text-sm font-medium hover:bg-white/10 transition-all"
                >
                  legal@gabvia.app
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LegalPageShell>
  );
}