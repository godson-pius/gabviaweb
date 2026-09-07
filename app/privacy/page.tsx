import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Gabvia",
  description: "Learn how Gabvia collects, uses, protects, and shares information across its website and multilingual communication app.",
  alternates: { canonical: "/privacy" },
};

function LegalHeader({ current }: { current: "privacy" | "terms" }) {
  return (
    <header className="legal-header">
      <Link className="legal-brand" href="/" aria-label="Gabvia home"><span className="legal-brand-mark"><Image className="legal-brand-logo" src="/logo.png" alt="" width={23} height={23} priority /></span><span>Gabvia</span></Link>
      <nav className="legal-nav" aria-label="Legal navigation">
        <Link className={current === "privacy" ? "is-current" : ""} href="/privacy">Privacy</Link>
        <Link className={current === "terms" ? "is-current" : ""} href="/terms">Terms</Link>
        <Link href="/delete-account">Delete account</Link>
        <Link href="/">Back to site <span aria-hidden="true">↗</span></Link>
      </nav>
    </header>
  );
}

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <LegalHeader current="privacy" />
      <div className="legal-layout">
        <aside className="legal-aside" aria-label="Privacy Policy contents">
          <span className="legal-eyebrow">Gabvia legal</span>
          <p className="legal-aside-copy">Clear information about the data behind every conversation.</p>
          <nav className="legal-contents"><a href="#scope">Scope</a><a href="#collect">Information we collect</a><a href="#use">How we use information</a><a href="#sharing">Sharing and providers</a><a href="#rights">Your rights</a><a href="#contact">Contact us</a></nav>
        </aside>

        <article className="legal-document">
          <div className="legal-document-intro">
            <span className="legal-eyebrow">Privacy Policy</span>
            <h1>Your privacy, in plain language.</h1>
            <p className="legal-lead">This Privacy Policy explains how Gabvia (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, discloses, and protects information when you visit our promotional website or use the Gabvia application.</p>
            <div className="legal-meta"><span>Last updated: August 23, 2026</span><span>Applies to gabvia.app and the Gabvia app</span></div>
          </div>

          <div className="legal-notice"><strong>The short version</strong><span>We collect what we need to run Gabvia, keep accounts secure, process requested translations, deliver notifications, support the waitlist, and verify GAB POINTS purchases. We do not sell personal information.</span></div>

          <section id="scope"><h2>1. Scope and who is responsible</h2><p>Gabvia, a company being established in Rwanda, is the data controller responsible for personal information covered by this Policy. This Policy covers the Gabvia mobile application, gabvia.app, the promotional-site waitlist, and related support or communications.</p><p>World Brain Technology Ltd., Gabvia&apos;s parent company, may provide corporate, technical, intellectual-property, or support services to Gabvia. It may process information on Gabvia&apos;s behalf or as an affiliate where necessary for those services.</p><p>It does not cover websites or services operated by third parties, including Firebase, Google, Expo, RevenueCat, Apple, or Google Play. Those providers process information under their own notices and terms.</p></section>

          <section id="collect"><h2>2. Information we collect</h2>
            <h3>Information you give us</h3>
            <ul><li><strong>Waitlist details:</strong> name, email address, country or region, preferred language, intended use case, and the source of your signup.</li><li><strong>Account details:</strong> email address, username, name, preferred or native language, password or authentication identifiers handled through Firebase Authentication, referral information, and account preferences.</li><li><strong>Messages and content:</strong> messages, group names, replies, events, scheduled messages, voice notes, and other content you choose to send or store through Gabvia. Content may include information about other people, so please only share it when you have a lawful basis to do so.</li><li><strong>Requests and correspondence:</strong> information you provide when you contact support, request account deletion, report a problem, or otherwise communicate with us.</li></ul>
            <h3>Information created or collected when you use Gabvia</h3>
            <ul><li><strong>Messaging metadata:</strong> account and conversation identifiers, participants, timestamps, delivery and read status, unread counts, and notification settings.</li><li><strong>Encryption information:</strong> public encryption keys and, if you enable key backup, a private-key backup encrypted with your PIN. The private key used by your device is stored locally in secure device storage.</li><li><strong>Device and notification information:</strong> device or operating-system information and Expo push tokens used to deliver notifications. You can disable notifications in your device settings.</li><li><strong>Purchases:</strong> GAB POINTS product, amount, points, currency, RevenueCat customer and transaction identifiers, purchase token, purchase status, and App Store or Google Play purchase information. Apple and Google process the payment credentials; Gabvia does not store your full card or bank-account credentials.</li><li><strong>Usage and security information:</strong> technical logs, error information, fraud-prevention signals, and information needed to investigate abuse or protect the service.</li></ul>
            <h3>Information from third parties</h3><p>We may receive authentication, payment status, purchase validation, notification delivery, or fraud-prevention information from service providers when you use their services with Gabvia. We may also receive information from another Gabvia user when they invite you to a conversation or group.</p>
          </section>

          <section id="use"><h2>3. How we use information</h2><p>We use personal information for the following purposes:</p><ul><li>to create and maintain accounts, authenticate users, sync conversations, and provide Gabvia features;</li><li>to deliver text, voice, translation, transcription, group, event, and notification features you request;</li><li>to process, verify, record, and reconcile GAB POINTS purchases and rewards;</li><li>to send waitlist updates, onboarding messages, service notices, security alerts, and other communications you request or that are necessary to operate the service;</li><li>to prevent fraud, abuse, unauthorized access, spam, and other harmful or unlawful activity;</li><li>to troubleshoot, maintain, secure, and improve Gabvia; and</li><li>to meet legal, accounting, tax, and regulatory obligations and to establish, exercise, or defend legal claims.</li></ul><p>Depending on the context and applicable law, our legal bases may include performance of a contract with you, your consent, our legitimate interests in operating and securing Gabvia, and compliance with a legal obligation. Where we rely on consent, you may withdraw it, although this does not affect processing that already occurred lawfully.</p></section>

          <section><h2>4. Messages, encryption, and AI features</h2><p>Gabvia is designed to protect direct private text messages with end-to-end encryption. In an encrypted direct conversation, the message payload stored by Gabvia is intended to be unreadable without the participants&apos; device keys. Public keys are stored so devices can establish encrypted communication.</p><p>Encryption is feature- and message-type dependent. Group conversations, voice notes, cached content, notifications, and older or unsupported message formats may not have the same protection. Notifications can reveal limited information on your device, and anyone with access to your unlocked device or account may be able to access content.</p><p>When you ask for translation, transcription, or another AI-assisted feature, the relevant content is processed by the service needed to provide that feature. For example, a message may be decrypted on your device before requested translation is sent to Google Gemini, and a voice note may be sent for transcription. Do not use these features for information that must never leave your device. AI output can be incomplete or incorrect and should be reviewed before you rely on it.</p></section>

          <section id="sharing"><h2>5. When we share information</h2><p>We share information only as reasonably necessary for the purposes described in this Policy:</p><ul><li><strong>Infrastructure providers:</strong> Google Firebase provides authentication, database, and storage services.</li><li><strong>AI processing:</strong> Google Gemini processes content you submit for requested translation, transcription, or related AI features.</li><li><strong>Notifications:</strong> Expo and its notification delivery infrastructure help deliver push notifications to your device.</li><li><strong>Payments:</strong> RevenueCat manages in-app purchase entitlement and transaction data, while Apple App Store and Google Play process native payments and may handle payment credentials.</li><li><strong>Communications:</strong> Resend may deliver waitlist, onboarding, password-reset, or other transactional email on our behalf.</li><li><strong>Legal and safety:</strong> we may disclose information when required by law, legal process, or a valid government request, or when reasonably necessary to protect users, Gabvia, or the public.</li><li><strong>Business changes:</strong> information may be transferred as part of a merger, acquisition, financing, reorganization, or sale of assets, subject to applicable law.</li></ul><p>We do not sell personal information or share it with third parties for their own cross-context behavioral advertising.</p></section>

          <section><h2>6. International processing</h2><p>Gabvia and its providers may process information in countries other than the country where you live. Gabvia will handle international processing and transfers in accordance with Rwanda&apos;s Law No. 058/2021 relating to the Protection of Personal Data and Privacy and other applicable data-protection laws, including any required safeguards, authorizations, registrations, or written agreements.</p></section>
          <section><h2>7. Retention and deletion</h2><p>We keep information for as long as needed to provide the service, maintain legitimate business and security records, resolve disputes, complete transactions, and meet legal obligations. Retention varies by data type.</p><p>You may request deletion of your account and associated active data by emailing <a href="mailto:legal@gabvia.app">legal@gabvia.app</a>. Deleting the app does not automatically delete your account. We may retain limited information where necessary for fraud prevention, payment reconciliation, tax or accounting records, legal claims, or other lawful reasons.</p></section>
          <section id="rights"><h2>8. Your privacy rights and choices</h2><p>Depending on where you live, you may have the right to access, correct, update, export, restrict, object to, or request deletion of your personal information. You may also have the right to withdraw consent and to complain to your local data-protection authority. Users in Rwanda may have rights under Law No. 058/2021 relating to the Protection of Personal Data and Privacy.</p><p>To make a request, email <a href="mailto:legal@gabvia.app">legal@gabvia.app</a> with the subject &quot;Privacy request&quot; and tell us what you need. We may ask for information to verify your identity and will respond within the period required by applicable law.</p><p>You can opt out of non-essential waitlist or marketing messages by using the unsubscribe option in the message or contacting us. You cannot opt out of essential account, security, purchase, or service communications while using Gabvia.</p></section>
          <section><h2>9. Cookies and local storage</h2><p>The promotional website does not currently use advertising cookies. It may use essential browser storage, including local storage, to remember your theme preference. Our hosting, security, or embedded third-party services may use strictly necessary technologies to deliver and protect the site. The mobile app may store preferences, session information, cached content, and encryption keys locally on your device.</p></section>
          <section><h2>10. Children&apos;s privacy</h2><p>Gabvia is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided us information, contact us so we can investigate and delete it where appropriate. If the law where you live sets a higher minimum age, that age applies.</p></section>
          <section><h2>11. Security</h2><p>We use reasonable administrative, technical, and organizational measures to protect information, including access controls, secure storage, encryption features, and transaction verification. No online service or device is completely secure. You are responsible for using a strong password, protecting your device and PIN, and telling us promptly about suspected unauthorized access.</p></section>
          <section><h2>12. Changes to this Policy</h2><p>We may update this Policy as Gabvia changes or as legal requirements develop. We will post the updated version here and change the date above. If a change materially affects your rights, we will provide additional notice where required.</p></section>
          <section id="contact" className="legal-contact"><h2>13. Contact us</h2><p>Questions, privacy requests, and concerns about this Policy can be sent to:</p><p><strong>Gabvia</strong><br /><a href="mailto:legal@gabvia.app">legal@gabvia.app</a></p></section>
        </article>
      </div>
      <footer className="legal-footer"><span>© 2026 Gabvia. Made for every voice.</span><span><Link href="/terms">Terms of Service</Link> · <Link href="/delete-account">Delete account</Link> · <Link href="/">Gabvia home</Link></span></footer>
    </main>
  );
}
