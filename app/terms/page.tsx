import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell, TocItem } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Service — Gabvia",
  description: "The rules and conditions for using the Gabvia website and multilingual communication app.",
  alternates: { canonical: "/terms" },
};

const TOC: TocItem[] = [
  { id: "agreement", label: "1. Agreement to Terms" },
  { id: "eligibility", label: "2. Eligibility & Accounts" },
  { id: "service", label: "3. The Gabvia Service" },
  { id: "content", label: "4. Your Content" },
  { id: "encryption", label: "5. Encryption & AI" },
  { id: "acceptable-use", label: "6. Acceptable Use" },
  { id: "payments", label: "7. GAB POINTS & Billing" },
  { id: "intellectual-property", label: "8. Intellectual Property" },
  { id: "third-party", label: "9. Third-Party Services" },
  { id: "termination", label: "10. Suspension & Termination" },
  { id: "disclaimers", label: "11. Disclaimers" },
  { id: "liability", label: "12. Limitation of Liability" },
  { id: "indemnity", label: "13. Indemnity" },
  { id: "governing-law", label: "14. Governing Law" },
  { id: "changes", label: "15. Changes to Terms" },
  { id: "contact", label: "16. Contact Us" },
];

export default function TermsPage() {
  return (
    <LegalPageShell
      current="terms"
      eyebrow="Terms of Service"
      title="Good conversations need shared ground."
      lead="These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Gabvia website, mobile application, and related services (together, the &quot;Service&quot;). The Service is operated by Gabvia (&quot;Gabvia&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), a company being established in Rwanda."
      meta={[
        "Last updated: August 23, 2026",
        "Governing law: Rwanda",
        "Subject to mandatory local consumer rights",
      ]}
      notice={{
        tag: "The short version",
        text: "Use Gabvia lawfully and respectfully, protect your account, and only share content you have the right to share. We provide communication tools; you remain responsible for what you send and for checking AI-generated output.",
        variant: "info",
      }}
      toc={TOC}
      asideCopy="The shared expectations and contractual conditions that keep every cross-language conversation trustworthy and secure."
    >
      <section id="agreement">
        <h2>1. Agreement to these Terms</h2>
        <p>
          By accessing or using the Service, creating an account, downloading or using the mobile application, or purchasing GAB POINTS, you agree to these Terms and our <Link href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>. If you do not agree, do not use the Service.
        </p>
        <p>
          If you use Gabvia for an organization, you confirm that you are authorized to accept these Terms for that organization, and &quot;you&quot; includes the organization.
        </p>
      </section>

      <section id="eligibility">
        <h2>2. Eligibility and accounts</h2>
        <ul>
          <li>You must be at least 13 years old, or older if the law where you live requires a higher age.</li>
          <li>You must provide accurate, current information and keep it updated.</li>
          <li>You are responsible for your password, device, PIN, encryption-key backup, and all activity under your account.</li>
          <li>Do not share credentials or allow another person to use your account in a way that violates these Terms.</li>
          <li>Tell us promptly at <a href="mailto:legal@gabvia.app" className="text-cyan-400 hover:underline">legal@gabvia.app</a> if you believe your account or security keys have been compromised.</li>
        </ul>
      </section>

      <section id="service">
        <h2>3. The Gabvia Service</h2>
        <p>
          Gabvia provides multilingual communication tools, including text messaging, voice notes, transcription, translation, group conversations, events, notifications, and related features. Some features may require GAB POINTS or may be limited by availability, device, language, region, or technical capacity.
        </p>
        <p>
          We may add, change, suspend, or remove features, including free features, when reasonably necessary to improve the Service, address safety or security concerns, comply with law, or operate the business. Where required, we will provide notice of material changes.
        </p>
        <p>
          Gabvia is not an emergency, medical, legal, financial, identity-verification, or guaranteed translation service. Do not rely on Gabvia as a substitute for professional advice, emergency communications, or a human interpreter where accuracy is critical.
        </p>
      </section>

      <section id="content">
        <h2>4. Your content and other people&apos;s content</h2>
        <p>
          You retain your rights in content you submit. You grant Gabvia and its service providers a limited, worldwide, non-exclusive license to host, store, reproduce, transmit, adapt technically, and process that content only as needed to operate, secure, support, and improve the Service or to provide a feature you request.
        </p>
        <p>
          You are responsible for your content, including its accuracy, legality, and impact on others. You confirm that you have the rights and permissions needed to send content, voice recordings, images, or personal information through Gabvia. Respect the privacy and consent of people who appear in your content.
        </p>
        <p>
          Messages can be copied, forwarded, screenshotted, recorded, or reported by recipients. Encryption does not prevent a recipient or someone with access to a device from sharing content.
        </p>
      </section>

      <section id="encryption">
        <h2>5. Encryption, translation, and AI</h2>
        <p>
          Gabvia is designed to use end-to-end encryption for supported direct private text messages. Encryption is not guaranteed for every feature or message type, including some group content, voice notes, notifications, cached content, or older formats. We cannot recover a private key or message that you permanently lose unless you created a usable backup.
        </p>
        <p>
          When you request translation, transcription, summarization, or another AI-assisted feature, relevant content may be processed by third-party AI infrastructure. AI results may contain errors, omissions, or inappropriate language. You are responsible for reviewing output before relying on it or sharing it.
        </p>
      </section>

      <section id="acceptable-use">
        <h2>6. Acceptable use</h2>
        <p>You may not use the Service to:</p>
        <ul>
          <li>break the law, infringe intellectual-property, privacy, or other rights, or facilitate wrongdoing;</li>
          <li>harass, threaten, stalk, exploit, abuse, defame, impersonate, or discriminate against another person;</li>
          <li>send spam, scams, phishing, malware, unwanted commercial messages, or harmful code;</li>
          <li>share sexual exploitation material, child sexual abuse material, credible threats, or content that promotes violence or terrorism;</li>
          <li>collect, profile, or monitor people without a lawful basis or their required permission;</li>
          <li>probe, scan, reverse engineer, scrape, overload, disrupt, or bypass security or access controls;</li>
          <li>misrepresent AI output as verified fact, or use Gabvia to make high-impact decisions about another person without appropriate human review; or</li>
          <li>help anyone else do any of the above.</li>
        </ul>
        <p>
          If you see content that violates these Terms or creates an immediate safety risk, contact <a href="mailto:legal@gabvia.app" className="text-cyan-400 hover:underline">legal@gabvia.app</a> with the relevant details. Do not put yourself in danger to collect evidence.
        </p>
      </section>

      <section id="payments">
        <h2>7. GAB POINTS and payments</h2>
        <p>
          GAB POINTS are prepaid, non-cash, non-transferable usage credits for eligible Gabvia features. They are not money, a deposit, a security, or a promise of future value. Unless applicable law requires otherwise, they cannot be redeemed for cash or transferred, sold, or exchanged outside Gabvia.
        </p>
        <p>
          Prices, point amounts, eligible features, currencies, and purchase minimums are shown at the time of purchase. A purchase is credited only after RevenueCat and the relevant app store confirm it. We may correct obvious pricing or accounting errors and may refuse or reverse transactions that appear fraudulent, duplicated, or unauthorized.
        </p>
        <p>
          GAB POINTS purchases are managed through RevenueCat and charged through Apple App Store or Google Play, depending on your device. RevenueCat, Apple, and Google may apply their own terms, billing rules, taxes, and refund processes. Request refunds through the app store that processed the purchase, or contact us at <a href="mailto:legal@gabvia.app" className="text-cyan-400 hover:underline">legal@gabvia.app</a>. Nothing in these Terms limits a refund or consumer right that cannot legally be excluded.
        </p>
        <p>
          We may change the price, availability, or use of GAB POINTS prospectively. Unless required by law, unused points do not create a right to a cash refund solely because a feature changes or your account is closed for a violation of these Terms.
        </p>
      </section>

      <section id="intellectual-property">
        <h2>8. Intellectual property</h2>
        <p>
          The Service, including its software, design, branding, logos, text, graphics, and other materials, belongs to Gabvia or its licensors and is protected by applicable law. We give you a limited, personal, revocable, non-exclusive, non-transferable license to use the Service for its intended purpose while you comply with these Terms.
        </p>
        <p>
          Do not copy, modify, distribute, sell, lease, sublicense, or create derivative works from the Service or Gabvia branding unless we give you written permission. Feedback you provide may be used by Gabvia without restriction or payment, provided we do not identify you publicly without permission.
        </p>
      </section>

      <section id="third-party">
        <h2>9. Third-party services</h2>
        <p>
          Gabvia depends on third-party services for hosting, authentication, storage, AI processing, notifications, email, payments, and app distribution. Those services may have outages, errors, or terms that apply directly to you. We are not responsible for independent third-party services, content, or policies, although we will take reasonable steps to maintain our integrations.
        </p>
      </section>

      <section id="termination">
        <h2>10. Suspension and termination</h2>
        <p>
          You may stop using Gabvia at any time and may request account deletion under our <Link href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link> or our <Link href="/delete-account" className="text-cyan-400 hover:underline">Account Deletion Guide</Link>. We may suspend or terminate access, remove content, or limit features if you breach these Terms, create security or payment risk, abuse other users, or where necessary to comply with law or protect the Service.
        </p>
        <p>
          Where reasonable and lawful, we will provide notice and an opportunity to address an issue. We may act without prior notice when needed to prevent harm, fraud, or ongoing abuse. Sections that by their nature should survive termination—including content responsibility, intellectual property, disclaimers, liability limits, disputes, and payment records—will survive.
        </p>
      </section>

      <section id="disclaimers">
        <h2>11. Disclaimers</h2>
        <p>
          To the maximum extent permitted by law, the Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties that it will be uninterrupted, error-free, secure, accurate, complete, or suitable for a particular purpose. We do not warrant that translation, transcription, AI output, message delivery, encryption, or account recovery will always be available or correct.
        </p>
        <p>
          Nothing in these Terms excludes a warranty, right, or remedy that applicable law does not allow us to exclude.
        </p>
      </section>

      <section id="liability">
        <h2>12. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Gabvia and its directors, employees, contractors, affiliates, licensors, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, goodwill, data, content, or business opportunities arising from or related to the Service.
        </p>
        <p>
          To the maximum extent permitted by law, our total liability for claims arising from the Service will not exceed the greater of the amount you paid to Gabvia for the Service in the 12 months before the event giving rise to the claim or USD 100. This limit does not apply where liability cannot legally be limited, including for fraud, willful misconduct, or rights that cannot be waived.
        </p>
      </section>

      <section id="indemnity">
        <h2>13. Indemnity</h2>
        <p>
          To the extent permitted by law, you agree to defend and reimburse Gabvia and its representatives for claims, losses, liabilities, and reasonable costs arising from your unlawful use of the Service, your content, your breach of these Terms, or your violation of another person&apos;s rights. This does not require you to indemnify us for our own unlawful conduct.
        </p>
      </section>

      <section id="governing-law">
        <h2>14. Governing law and disputes</h2>
        <p>
          These Terms are governed by the laws of Rwanda, without regard to conflict-of-law rules, except that mandatory consumer-protection or other rights in your place of residence continue to apply where required. Before bringing a formal claim, please contact us at <a href="mailto:legal@gabvia.app" className="text-cyan-400 hover:underline">legal@gabvia.app</a> so we can try to resolve the issue. Nothing prevents you from bringing a claim before a court or regulator where applicable law gives you that right.
        </p>
      </section>

      <section id="changes">
        <h2>15. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. We will post the new version and update the date above. If a change materially affects your rights or obligations, we will provide additional notice where required. Continuing to use the Service after the effective date means you accept the updated Terms. If you do not agree, stop using the Service.
        </p>
      </section>

      <section id="contact">
        <h2>16. Contact us</h2>
        <p>Questions about these Terms, account access, safety, or payments can be sent to:</p>
        <div className="rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-white/5 dark:bg-white/5 light:bg-slate-100 p-5 mt-4">
          <p className="font-semibold text-slate-900 dark:text-white mb-1">Gabvia Legal Team</p>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">World Brain Technology Ltd.</p>
          <a
            href="mailto:legal@gabvia.app"
            className="text-cyan-500 hover:text-cyan-400 font-medium inline-flex items-center gap-1.5"
          >
            legal@gabvia.app
          </a>
        </div>
      </section>
    </LegalPageShell>
  );
}
