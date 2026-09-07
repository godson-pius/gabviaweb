import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Delete Your Gabvia Account",
  description: "Learn how to delete your Gabvia account from the mobile app or contact Gabvia support for help.",
  alternates: { canonical: "/delete-account" },
};

function LegalHeader() {
  return (
    <header className="legal-header">
      <Link className="legal-brand" href="/" aria-label="Gabvia home"><span className="legal-brand-mark"><Image className="legal-brand-logo" src="/logo.png" alt="" width={23} height={23} priority /></span><span>Gabvia</span></Link>
      <nav className="legal-nav" aria-label="Help and legal navigation">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link className="is-current" href="/delete-account">Delete account</Link>
        <Link href="/">Back to site <span aria-hidden="true">↗</span></Link>
      </nav>
    </header>
  );
}

export default function DeleteAccountPage() {
  return (
    <main className="legal-page">
      <LegalHeader />
      <div className="legal-layout">
        <aside className="legal-aside" aria-label="Delete account contents">
          <span className="legal-eyebrow">Gabvia account help</span>
          <p className="legal-aside-copy">A straightforward way to remove your Gabvia account and associated active data.</p>
          <nav className="legal-contents"><a href="#in-app">Delete in the app</a><a href="#before-you-delete">Before you delete</a><a href="#need-help">Need help?</a></nav>
        </aside>

        <article className="legal-document">
          <div className="legal-document-intro">
            <span className="legal-eyebrow">Delete your account</span>
            <h1>Ready to leave? You are in control.</h1>
            <p className="legal-lead">You can delete your Gabvia account directly from the mobile app. The option is at the bottom of the Settings screen so it is easy to find when you need it.</p>
          </div>

          <div className="legal-notice"><strong>Important</strong><span>Account deletion cannot be undone. Deleting the app from your phone does not delete your Gabvia account.</span></div>

          <section id="in-app"><h2>Delete your account in the mobile app</h2><ol><li>Open Gabvia and go to <strong>Settings</strong>.</li><li>Scroll down to the bottom of the Settings screen.</li><li>Under <strong>Actions</strong>, tap <strong>Delete account</strong>.</li><li>Review the confirmation message, then tap <strong>Delete</strong> to confirm.</li></ol><p>Gabvia will remove your profile and delete your account. You may be asked to log in again first as a security check.</p></section>

          <section id="before-you-delete"><h2>Before you delete</h2><p>Make sure you have saved anything you may need from your account. Account deletion is permanent, and you may lose access to your conversations, profile information, and other account data.</p><p>For more information about deletion and data retention, read our <Link href="/privacy">Privacy Policy</Link>.</p></section>

          <section id="need-help" className="legal-contact"><h2>Cannot delete your account?</h2><p>If the delete option is not working or you cannot access your account, contact us at <a href="mailto:officialgabvia@gmail.com">officialgabvia@gmail.com</a>. Please include the email address associated with your Gabvia account and a short description of the problem.</p></section>
        </article>
      </div>
      <footer className="legal-footer"><span>© 2026 Gabvia. Made for every voice.</span><span><Link href="/privacy">Privacy Policy</Link> · <Link href="/terms">Terms of Service</Link> · <Link href="/">Gabvia home</Link></span></footer>
    </main>
  );
}