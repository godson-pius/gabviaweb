"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type IconName =
  | "arrow-up-right"
  | "arrow-right"
  | "globe"
  | "lock"
  | "mic"
  | "spark"
  | "play"
  | "users"
  | "check"
  | "menu"
  | "close"
  | "sun"
  | "moon";

type WaitlistForm = {
  full_name: string;
  email: string;
  country: string;
  native_language: string;
  use_case: string;
  website: string;
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths = {
    "arrow-up-right": <><path d="M7 17 17 7" /><path d="M7 7h10v10" /></>,
    "arrow-right": <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" /></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></>,
    spark: <><path d="m12 3-1.5 5.5L5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5L12 3Z" /><path d="m19 16-.7 2.3L16 19l2.3.7L19 22l.7-2.3L22 19l-2.3-.7L19 16Z" /></>,
    play: <><path d="m9 6 9 6-9 6V6Z" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" /></>,
    moon: <><path d="M20.5 14.7A8.5 8.5 0 0 1 9.3 3.5 8.5 8.5 0 1 0 20.5 14.7Z" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function GabviaMark({ compact = false }: { compact?: boolean }) {
  return (
    <a className={`brand ${compact ? "brand-compact" : ""}`} href="#top" aria-label="Gabvia home">
      <Image className="brand-image" src="/logo.png" alt="" width={32} height={32} priority={!compact} />
      <span>Gabvia</span>
    </a>
  );
}

const featureCards = [
  { number: "01", icon: "globe" as IconName, title: "Talk naturally", text: "Write in the language you think in. Gabvia makes sure your meaning arrives clearly on the other side.", color: "blue" },
  { number: "02", icon: "mic" as IconName, title: "Keep your voice", text: "Send voice notes when text is not enough. Get clear transcriptions that make every thought easy to follow.", color: "lime" },
  { number: "03", icon: "users" as IconName, title: "Bring everyone in", text: "Create group conversations where language fades into the background and people stay at the center.", color: "violet" },
];

const faqItems = [
  { question: "What is Gabvia?", answer: "Gabvia is an AI-powered multilingual communication infrastructure that helps people message, speak, and connect across language barriers." },
  { question: "What can I use Gabvia for?", answer: "Use text chat, voice notes, translations, and group conversations with friends, family, communities, or work teams." },
  { question: "Are my conversations private?", answer: "Private conversations are designed with end-to-end encryption. Translation and transcription only process content when you request those features." },
  { question: "How do GAB POINTS work?", answer: "GAB POINTS are usage credits for features such as translations. You can earn some through product missions or purchase more when needed." },
];

const emptyWaitlistForm: WaitlistForm = { full_name: "", email: "", country: "", native_language: "", use_case: "", website: "" };

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistSource, setWaitlistSource] = useState("promotional-site");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedTheme = window.localStorage.getItem("gabvia-promo-theme");
      if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const toggleTheme = () => setTheme((current) => {
    const nextTheme = current === "dark" ? "light" : "dark";
    window.localStorage.setItem("gabvia-promo-theme", nextTheme);
    return nextTheme;
  });
  const closeMenu = () => setMenuOpen(false);
  const openWaitlist = (source = "promotional-site") => {
    setWaitlistSource(source);
    setWaitlistOpen(true);
    setMenuOpen(false);
  };

  return (
    <main id="top" className={`promo-site theme-${theme}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <nav className="site-nav shell" aria-label="Main navigation">
        <GabviaMark />
        <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
          <a href="#why-gabvia" onClick={closeMenu}>Why Gabvia</a>
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#how-it-works" onClick={closeMenu}>How it works</a>
          <a href="#download" onClick={closeMenu}>Download</a>
        </div>
        <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} aria-pressed={theme === "light"}><Icon name={theme === "dark" ? "sun" : "moon"} size={16} /><span>{theme === "dark" ? "Light" : "Dark"}</span></button>
        <a className="nav-cta" href="#download" onClick={(event) => { event.preventDefault(); openWaitlist("nav"); }}>Get Gabvia <Icon name="arrow-up-right" size={15} /></a>
        <button className="menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>
      </nav>

      <section className="hero shell" id="main-content">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> Translation that keeps up</div>
          <h1>Say it in your language. <em>Feel it in theirs.</em></h1>
          <p className="hero-text">Gabvia is the multilingual chat app for conversations that cross borders, time zones, and everything in between.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#download" onClick={(event) => { event.preventDefault(); openWaitlist("hero"); }}>Start talking <Icon name="arrow-right" size={17} /></a>
            <a className="button button-quiet" href="#how-it-works"><span className="play-icon"><Icon name="play" size={13} /></span> See how it works</a>
          </div>
          <div className="hero-note"><span className="avatar-stack"><i>J</i><i>M</i><i>A</i></span><span>Made for real people, everywhere.</span></div>
        </div>

        <div className="hero-visual" aria-label="Gabvia chat preview">
          <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
          <div className="floating-card floating-card-top"><span className="floating-icon blue-icon"><Icon name="globe" size={16} /></span><span><strong>Meaning, not just words.</strong><small>Translation in context</small></span></div>
          <div className="floating-card floating-card-bottom"><span className="status-pulse" /><span><strong>Private by design</strong><small><Icon name="lock" size={11} /> Your chats stay yours</small></span></div>
          <div className="phone-shell">
            <div className="phone-speaker" />
            <div className="phone-screen">
              <div className="phone-topbar"><span className="phone-time">9:41</span><span className="phone-signal"><i /><i /><i /></span></div>
              <div className="chat-heading"><div className="back-arrow">‹</div><div className="chat-user"><span className="person-avatar">N</span><span><b>Nadia</b><small><i /> online now</small></span></div><span className="more-dots">•••</span></div>
              <div className="date-divider"><span>Today, 10:24 AM</span></div>
              <div className="message-row received"><span className="mini-avatar">N</span><div className="message-group"><div className="message-bubble white-bubble">Hey! Are we still on for tonight?</div><span className="message-time">10:24 AM</span></div></div>
              <div className="message-row sent"><div className="message-group"><div className="message-bubble gradient-bubble">Yes! I can&apos;t wait to see you</div><div className="translated-line"><Icon name="spark" size={11} /> Translated to French</div><span className="message-time">10:25 AM <b>✓✓</b></span></div></div>
              <div className="message-row received later"><span className="mini-avatar">N</span><div className="message-group"><div className="message-bubble white-bubble">Parfait, à tout à l&apos;heure! <span className="wave-emoji">✦</span></div><span className="message-time">10:25 AM</span></div></div>
              <div className="voice-card"><span className="voice-play"><Icon name="play" size={13} /></span><span className="waveform"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></span><span className="voice-length">0:18</span><span className="voice-translate"><Icon name="spark" size={11} /> Transcript ready</span></div>
              <div className="composer"><span>Message...</span><span className="composer-icons"><Icon name="mic" size={16} /><b>↑</b></span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee-band" aria-label="Gabvia benefits"><div className="marquee-content"><span>One conversation</span><b>✦</b><span>Every language</span><b>✦</b><span>More understanding</span><b>✦</b><span>One conversation</span><b>✦</b><span>Every language</span><b>✦</b></div></div>

      <section className="intro-section shell" id="why-gabvia">
        <div className="section-kicker">The world is already talking</div>
        <div className="intro-grid"><h2>Language should never be the reason you <span>stay strangers.</span></h2><div className="intro-side"><p>Gabvia brings translation into the flow of your conversation, so you can spend less time decoding and more time connecting.</p><a className="text-link" href="#features">Explore the difference <Icon name="arrow-up-right" size={15} /></a></div></div>
      </section>

      <section className="features-section shell" id="features">
        <div className="section-heading"><div><div className="section-kicker">Made for connection</div><h2>Everything you need to <span>meet in the middle.</span></h2></div><p>Simple enough for everyday messages. Powerful enough for the conversations that matter most.</p></div>
        <div className="feature-grid">{featureCards.map((feature) => <article className={`feature-card ${feature.color}`} key={feature.number}><div className="feature-top"><span className="feature-number">{feature.number}</span><span className="feature-icon"><Icon name={feature.icon} size={21} /></span></div><h3>{feature.title}</h3><p>{feature.text}</p><a href="#download" onClick={(event) => { event.preventDefault(); openWaitlist(`feature-${feature.number}`); }} aria-label={`Learn more about ${feature.title}`}><Icon name="arrow-up-right" size={17} /></a></article>)}</div>
      </section>

      <section className="showcase-section shell" id="how-it-works">
        <div className="showcase-panel"><div className="showcase-copy"><div className="section-kicker light-kicker">The Gabvia way</div><h2>Translation that understands the <span>conversation.</span></h2><p>Gabvia is built to keep your voice, your tone, and your intent in the room. It is not about replacing connection. It is about making more of it possible.</p><div className="check-list"><div><span><Icon name="check" size={14} /></span> Your language, your way</div><div><span><Icon name="check" size={14} /></span> Context-aware translations</div><div><span><Icon name="check" size={14} /></span> Text, voice, and group chat</div></div><a className="button button-light" href="#download" onClick={(event) => { event.preventDefault(); openWaitlist("showcase"); }}>Discover Gabvia <Icon name="arrow-right" size={17} /></a></div><div className="translation-art"><div className="art-glow" /><div className="translation-card translation-card-back"><small>Original</small><strong>Let&apos;s make it happen.</strong><span>English</span></div><div className="translation-card translation-card-front"><div><span className="spark-badge"><Icon name="spark" size={13} /></span><small>Gabvia translation</small></div><strong>Faisons-le.</strong><span>French · in context</span></div><div className="art-label"><span className="art-label-dot" /> Meaning preserved</div></div></div>
      </section>

      <section className="steps-section shell"><div className="section-heading steps-heading"><div><div className="section-kicker">It just works</div><h2>Three steps to a <span>better conversation.</span></h2></div></div><div className="steps-grid"><div className="step"><span className="step-number">01</span><h3>Choose your language</h3><p>Set your preferred language once. Gabvia takes care of the rest.</p></div><div className="step-connector" /><div className="step"><span className="step-number">02</span><h3>Say what you mean</h3><p>Type a message, send a voice note, or start a group chat.</p></div><div className="step-connector" /><div className="step"><span className="step-number">03</span><h3>Connect naturally</h3><p>Everyone receives the conversation in the language they know best.</p></div></div></section>

      <section className="faq-section shell" id="faq"><div className="section-heading steps-heading"><div><div className="section-kicker">Good questions</div><h2>Everything you need to know <span>before you join.</span></h2></div></div><div className="faq-list">{faqItems.map((item) => <details className="faq-item" key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div></section>

      <section className="download-section shell" id="download"><div className="download-panel"><div className="download-copy"><div className="section-kicker light-kicker">Your world, a little closer</div><h2>Start a conversation that goes <span>everywhere.</span></h2><p>Gabvia is free to get started. Bring your people. We&apos;ll handle the language.</p><a className="button button-primary" href="#download" onClick={(event) => { event.preventDefault(); openWaitlist("early-access"); }}>Get early access <Icon name="arrow-up-right" size={17} /></a></div><div className="download-mark"><span className="download-orbit" /><span className="download-g" /><small>gabvia</small></div></div></section>

      <footer className="site-footer shell"><GabviaMark compact /><div className="footer-links"><a href="#why-gabvia">Why Gabvia</a><a href="#features">Features</a><a href="#faq">FAQ</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:hello@gabvia.app">Contact</a><a href="#download" onClick={(event) => { event.preventDefault(); openWaitlist("footer"); }}>Get the app</a></div><p>© 2026 Gabvia. Made for every voice.</p></footer>
      <WaitlistModal open={waitlistOpen} source={waitlistSource} onClose={() => setWaitlistOpen(false)} />
    </main>
  );
}

function WaitlistModal({ open, source, onClose }: { open: boolean; source: string; onClose: () => void }) {
  const [form, setForm] = useState<WaitlistForm>(emptyWaitlistForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  if (!open) return null;
  const updateField = (field: keyof WaitlistForm, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const close = () => { setForm(emptyWaitlistForm); setStatus("idle"); setMessage(""); onClose(); };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    try {
      const response = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, source }) });
      const payload = await response.json() as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Could not join the waitlist.");
      setStatus("success");
      setMessage(payload.message ?? "You are on the Gabvia waitlist.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not join the waitlist.");
    }
  };
  return <div className="waitlist-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><section className="waitlist-modal" role="dialog" aria-modal="true" aria-labelledby="waitlist-title"><button className="waitlist-close" onClick={close} aria-label="Close waitlist form"><Icon name="close" size={18} /></button>{status === "success" ? <div className="waitlist-success"><span className="waitlist-success-icon"><Icon name="check" size={24} /></span><div className="section-kicker">You&apos;re in</div><h2>Welcome to the <span>conversation.</span></h2><p>{message} We&apos;ll be in touch when Gabvia is ready for you.</p><button className="button button-primary" onClick={close}>Done <Icon name="arrow-right" size={16} /></button></div> : <><div className="waitlist-modal-head"><div className="section-kicker">Early access</div><h2 id="waitlist-title">Bring your people. <span>We&apos;ll handle the language.</span></h2><p>Join the Gabvia waitlist and be among the first to experience conversations without borders.</p></div><form className="waitlist-form" onSubmit={submit}><label>Full name<input value={form.full_name} onChange={(event) => updateField("full_name", event.target.value)} placeholder="Your name" autoComplete="name" required /></label><label>Email address<input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label><div className="waitlist-form-row"><label>Country / region<input value={form.country} onChange={(event) => updateField("country", event.target.value)} placeholder="Where are you based?" required /></label><label>Preferred language<input value={form.native_language} onChange={(event) => updateField("native_language", event.target.value)} placeholder="e.g. English" required /></label></div><label>How will you use Gabvia?<select value={form.use_case} onChange={(event) => updateField("use_case", event.target.value)} required><option value="">Choose one</option><option value="Personal conversations">Personal conversations</option><option value="Friends and family">Friends and family</option><option value="Business and work">Business and work</option><option value="Community or creator work">Community or creator work</option></select></label><input className="waitlist-honeypot" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => updateField("website", event.target.value)} aria-hidden="true" />{status === "error" && <div className="waitlist-error">{message}</div>}<button className="button button-primary waitlist-submit" type="submit" disabled={status === "submitting"}>{status === "submitting" ? "Joining…" : "Join the waitlist"}<Icon name="arrow-up-right" size={16} /></button><small className="waitlist-privacy">We&apos;ll only use these details to contact you about Gabvia early access.</small></form></>}</section></div>;
}
