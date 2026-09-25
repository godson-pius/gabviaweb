"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=app.gabvia&pcampaignid=web_share";

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
    "arrow-up-right": (
      <>
        <path d="M7 17 17 7" />
        <path d="M7 7h10v10" />
      </>
    ),
    "arrow-right": (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
      </>
    ),
    mic: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3-1.5 5.5L5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5L12 3Z" />
        <path d="m19 16-.7 2.3L16 19l2.3.7L19 22l.7-2.3L22 19l-2.3-.7L19 16Z" />
      </>
    ),
    play: <path d="m9 6 9 6-9 6V6Z" />,
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
      </>
    ),
    moon: (
      <>
        <path d="M20.5 14.7A8.5 8.5 0 0 1 9.3 3.5 8.5 8.5 0 0 0 20.5 14.7Z" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function GooglePlayIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.609 1.814C3.255 2.188 3 2.766 3 3.518v16.964c0 .752.255 1.33.609 1.704l.089.085 9.539-9.54v-.224L3.698 1.729l-.089.085z"
        fill="#00E676"
      />
      <path
        d="M16.417 15.932l-3.18-3.18v-.224l3.18-3.18.072.041 3.766 2.14c1.076.61 1.076 1.613 0 2.223l-3.766 2.14-.072.04z"
        fill="#FFD600"
      />
      <path
        d="M16.489 15.891L13.237 12.64 3.609 22.268c.355.378.955.424 1.636.037l11.244-6.414"
        fill="#FF3D00"
      />
      <path
        d="M16.489 8.109L5.245 1.695c-.681-.387-1.281-.341-1.636.037L13.237 11.36l3.252-3.251z"
        fill="#00B0FF"
      />
    </svg>
  );
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
  {
    number: "01",
    icon: "globe" as IconName,
    title: "Talk naturally",
    text: "Write in the language you think in. Gabvia makes sure your meaning arrives clearly on the other side.",
    color: "blue",
  },
  {
    number: "02",
    icon: "mic" as IconName,
    title: "Keep your voice",
    text: "Send voice notes when text is not enough. Get clear transcriptions that make every thought easy to follow.",
    color: "lime",
  },
  {
    number: "03",
    icon: "users" as IconName,
    title: "Bring everyone in",
    text: "Create group conversations where language fades into the background and people stay at the center.",
    color: "violet",
  },
];

const faqItems = [
  {
    question: "Can I use Gabvia on the web without installing the app?",
    answer:
      "Yes! You can register, sign in, and chat directly in your web browser. All direct conversations on the web are protected with client-side end-to-end encryption so your privacy is preserved whether on web or mobile.",
  },
  {
    question: "Where can I download Gabvia?",
    answer:
      "Gabvia is officially live on Google Play! You can download the app directly to your Android device, or simply chat online right here on Gabvia Web.",
  },
  {
    question: "What is Gabvia?",
    answer:
      "Gabvia is an AI-powered multilingual communication app that helps people message, speak, and connect across language barriers.",
  },
  {
    question: "What can I use Gabvia for?",
    answer:
      "Use text chat, voice notes, instant translations, and group conversations with friends, family, communities, or international work teams.",
  },
  {
    question: "Are my conversations private?",
    answer:
      "Private conversations are designed with end-to-end encryption. Translation and transcription only process content when you request those features.",
  },
  {
    question: "How do GAB POINTS work?",
    answer:
      "GAB POINTS are usage credits for features such as translations. You can earn some through product missions or purchase more when needed directly in the app.",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedTheme = window.localStorage.getItem("gabvia-promo-theme");
      if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleTheme = () =>
    setTheme((current) => {
      const nextTheme = current === "dark" ? "light" : "dark";
      window.localStorage.setItem("gabvia-promo-theme", nextTheme);
      return nextTheme;
    });

  const closeMenu = () => setMenuOpen(false);

  return (
    <main id="top" className={`promo-site theme-${theme}`}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <nav className="site-nav shell" aria-label="Main navigation">
        <GabviaMark />
        <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
          <a href="#why-gabvia" onClick={closeMenu}>
            Why Gabvia
          </a>
          <a href="#features" onClick={closeMenu}>
            Features
          </a>
          <a href="#how-it-works" onClick={closeMenu}>
            How it works
          </a>
          <a href="#download" onClick={closeMenu}>
            Download
          </a>
          <Link href="/translator" onClick={closeMenu} className="font-semibold text-slate-300 hover:text-emerald-400">
            Translator
          </Link>
          <Link href="/chat" onClick={closeMenu} className="nav-link-chat font-semibold text-emerald-400">
            Chat on Web
          </Link>
        </div>
        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          aria-pressed={theme === "light"}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
        <Link
          className="nav-cta"
          href="/chat"
        >
          Chat on Web <Icon name="arrow-right" size={15} />
        </Link>
        <button
          className="menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>
      </nav>

      <section className="hero shell" id="main-content">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> Now Live on Web &amp; Google Play
          </div>
          <h1>
            Say it in your language. <em>Feel it in theirs.</em>
          </h1>
          <p className="hero-text">
            Gabvia is the multilingual chat app for conversations that cross borders, time
            zones, and everything in between. Chat directly in your browser or download the app.
          </p>
          <div className="hero-actions">
            <Link
              className="button button-accent"
              href="/chat"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: "700" }}
            >
              <Icon name="spark" size={15} /> Chat on Web
            </Link>
            <a
              className="button button-playstore"
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download Gabvia on Google Play Store"
            >
              <GooglePlayIcon size={22} />
              <span className="playstore-text">
                <small>GET IT ON</small>
                <strong>Google Play</strong>
              </span>
            </a>
            <a className="button button-quiet" href="#how-it-works">
              <span className="play-icon">
                <Icon name="play" size={13} />
              </span>{" "}
              See how it works
            </a>
          </div>
          <div className="hero-note">
            <span className="avatar-stack">
              <i>J</i>
              <i>M</i>
              <i>A</i>
            </span>
            <span>Now on Web &amp; Android · Free to register</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Gabvia chat preview">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="floating-card floating-card-top">
            <span className="floating-icon blue-icon">
              <Icon name="globe" size={16} />
            </span>
            <span>
              <strong>Meaning, not just words.</strong>
              <small>Translation in context</small>
            </span>
          </div>
          <div className="floating-card floating-card-bottom">
            <span className="status-pulse" />
            <span>
              <strong>Private by design</strong>
              <small>
                <Icon name="lock" size={11} /> Your chats stay yours
              </small>
            </span>
          </div>
          <div className="phone-shell">
            <div className="phone-speaker" />
            <div className="phone-screen">
              <div className="phone-topbar">
                <span className="phone-time">9:41</span>
                <span className="phone-signal">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <div className="chat-heading">
                <div className="back-arrow">‹</div>
                <div className="chat-user">
                  <span className="person-avatar">N</span>
                  <span>
                    <b>Nadia</b>
                    <small>
                      <i /> online now
                    </small>
                  </span>
                </div>
                <span className="more-dots">•••</span>
              </div>
              <div className="date-divider">
                <span>Today, 10:24 AM</span>
              </div>
              <div className="message-row received">
                <span className="mini-avatar">N</span>
                <div className="message-group">
                  <div className="message-bubble white-bubble">
                    Hey! Are we still on for tonight?
                  </div>
                  <span className="message-time">10:24 AM</span>
                </div>
              </div>
              <div className="message-row sent">
                <div className="message-group">
                  <div className="message-bubble gradient-bubble">
                    Yes! I can&apos;t wait to see you
                  </div>
                  <div className="translated-line">
                    <Icon name="spark" size={11} /> Translated to French
                  </div>
                  <span className="message-time">
                    10:25 AM <b>✓✓</b>
                  </span>
                </div>
              </div>
              <div className="message-row received later">
                <span className="mini-avatar">N</span>
                <div className="message-group">
                  <div className="message-bubble white-bubble">
                    Parfait, à tout à l&apos;heure! <span className="wave-emoji">✦</span>
                  </div>
                  <span className="message-time">10:25 AM</span>
                </div>
              </div>
              <div className="voice-card">
                <span className="voice-play">
                  <Icon name="play" size={13} />
                </span>
                <span className="waveform">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span className="voice-length">0:18</span>
                <span className="voice-translate">
                  <Icon name="spark" size={11} /> Transcript ready
                </span>
              </div>
              <div className="composer">
                <span>Message...</span>
                <span className="composer-icons">
                  <Icon name="mic" size={16} />
                  <b>↑</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee-band" aria-label="Gabvia benefits">
        <div className="marquee-content">
          <span>One conversation</span>
          <b>✦</b>
          <span>Every language</span>
          <b>✦</b>
          <span>More understanding</span>
          <b>✦</b>
          <span>One conversation</span>
          <b>✦</b>
          <span>Every language</span>
          <b>✦</b>
        </div>
      </div>

      <section className="intro-section shell" id="why-gabvia">
        <div className="section-kicker">The world is already talking</div>
        <div className="intro-grid">
          <h2>
            Language should never be the reason you <span>stay strangers.</span>
          </h2>
          <div className="intro-side">
            <p>
              Gabvia brings translation into the flow of your conversation, so you can spend
              less time decoding and more time connecting.
            </p>
            <a className="text-link" href="#features">
              Explore the difference <Icon name="arrow-up-right" size={15} />
            </a>
          </div>
        </div>
      </section>

      <section className="features-section shell" id="features">
        <div className="section-heading">
          <div>
            <div className="section-kicker">Made for connection</div>
            <h2>
              Everything you need to <span>meet in the middle.</span>
            </h2>
          </div>
          <p>
            Simple enough for everyday messages. Powerful enough for the conversations that
            matter most.
          </p>
        </div>
        <div className="feature-grid">
          {featureCards.map((feature) => (
            <article className={`feature-card ${feature.color}`} key={feature.number}>
              <div className="feature-top">
                <span className="feature-number">{feature.number}</span>
                <span className="feature-icon">
                  <Icon name={feature.icon} size={21} />
                </span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Get Gabvia on Google Play to ${feature.title.toLowerCase()}`}
              >
                <Icon name="arrow-up-right" size={17} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="showcase-section shell" id="how-it-works">
        <div className="showcase-panel">
          <div className="showcase-copy">
            <div className="section-kicker light-kicker">The Gabvia way</div>
            <h2>
              Translation that understands the <span>conversation.</span>
            </h2>
            <p>
              Gabvia is built to keep your voice, your tone, and your intent in the room. It is
              not about replacing connection. It is about making more of it possible.
            </p>
            <div className="check-list">
              <div>
                <span>
                  <Icon name="check" size={14} />
                </span>{" "}
                Your language, your way
              </div>
              <div>
                <span>
                  <Icon name="check" size={14} />
                </span>{" "}
                Context-aware translations
              </div>
              <div>
                <span>
                  <Icon name="check" size={14} />
                </span>{" "}
                Text, voice, and group chat
              </div>
            </div>
            <a
              className="button button-light"
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download on Google Play <Icon name="arrow-up-right" size={17} />
            </a>
          </div>
          <div className="translation-art">
            <div className="art-glow" />
            <div className="translation-card translation-card-back">
              <small>Original</small>
              <strong>Let&apos;s make it happen.</strong>
              <span>English</span>
            </div>
            <div className="translation-card translation-card-front">
              <div>
                <span className="spark-badge">
                  <Icon name="spark" size={13} />
                </span>
                <small>Gabvia translation</small>
              </div>
              <strong>Faisons-le.</strong>
              <span>French · in context</span>
            </div>
            <div className="art-label">
              <span className="art-label-dot" /> Meaning preserved
            </div>
          </div>
        </div>
      </section>

      <section className="steps-section shell">
        <div className="section-heading steps-heading">
          <div>
            <div className="section-kicker">It just works</div>
            <h2>
              Three steps to a <span>better conversation.</span>
            </h2>
          </div>
        </div>
        <div className="steps-grid">
          <div className="step">
            <span className="step-number">01</span>
            <h3>Choose your language</h3>
            <p>Set your preferred language once. Gabvia takes care of the rest.</p>
          </div>
          <div className="step-connector" />
          <div className="step">
            <span className="step-number">02</span>
            <h3>Say what you mean</h3>
            <p>Type a message, send a voice note, or start a group chat.</p>
          </div>
          <div className="step-connector" />
          <div className="step">
            <span className="step-number">03</span>
            <h3>Connect naturally</h3>
            <p>Everyone receives the conversation in the language they know best.</p>
          </div>
        </div>
      </section>

      <section className="faq-section shell" id="faq">
        <div className="section-heading steps-heading">
          <div>
            <div className="section-kicker">Good questions</div>
            <h2>
              Everything you need to know <span>getting started.</span>
            </h2>
          </div>
        </div>
        <div className="faq-list">
          {faqItems.map((item) => (
            <details className="faq-item" key={item.question}>
              <summary>
                {item.question}
                <span>+</span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="download-section shell" id="download">
        <div className="download-panel">
          <div className="download-copy">
            <div className="section-kicker light-kicker">Available Now on Google Play</div>
            <h2>
              Start a conversation that goes <span>everywhere.</span>
            </h2>
            <p>
              Gabvia is officially live on Google Play and free to download. Bring your
              people—we&apos;ll handle the language.
            </p>
            <div className="download-actions">
              <a
                className="button button-playstore button-playstore-light"
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get Gabvia on Google Play"
              >
                <GooglePlayIcon size={26} />
                <span className="playstore-text">
                  <small>GET IT ON</small>
                  <strong>Google Play</strong>
                </span>
              </a>
            </div>
          </div>
          <div className="download-mark">
            <span className="download-orbit" />
            <span className="download-g" />
            <small>gabvia</small>
          </div>
        </div>
      </section>

      <footer className="site-footer shell">
        <GabviaMark compact />
        <div className="footer-links">
          <a href="#why-gabvia">Why Gabvia</a>
          <a href="#features">Features</a>
          <Link href="/translator">Translator</Link>
          <a href="#faq">FAQ</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/delete-account">Delete account</a>
          <a href="mailto:officialgabvia@gmail.com">Contact</a>
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
            Get on Google Play
          </a>
        </div>
        <p>© 2026 Gabvia. Made for every voice.</p>
      </footer>
    </main>
  );
}
