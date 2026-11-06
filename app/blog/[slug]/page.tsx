import { ArticleShareBar } from "@/components/blog/ArticleShareBar";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { GooglePlayIcon, PLAY_STORE_URL } from "@/components/landing/shared";
import {
  BlogPost,
  getAllBlogPosts,
  getBlogPostBySlug,
  getRelatedPosts,
} from "@/lib/blog-data";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  HeartHandshake,
  Lightbulb,
  Quote,
  Sparkles,
  Tag,
  XCircle
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://gabvia.app").replace(/\/+$/, "");

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | Gabvia Blog",
      description: "The requested article could not be found.",
    };
  }

  const articleUrl = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: `${post.title} | Gabvia Blog`,
    description: post.seo.metaDescription || post.excerpt,
    keywords: post.seo.keywords,
    authors: [{ name: post.author.name }],
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: articleUrl,
      siteName: "Gabvia",
      type: "article",
      publishedTime: post.isoDate,
      authors: [post.author.name],
      tags: post.tags,
      images: [
        {
          url: "/logo.png",
          width: 512,
          height: 512,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: ["/logo.png"],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug, 3);
  const articleUrl = `${SITE_URL}/blog/${post.slug}`;

  // JSON-LD Schema: BlogPosting & BreadcrumbList
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${articleUrl}#article`,
        isPartOf: {
          "@type": "Blog",
          "@id": `${SITE_URL}/blog`,
          name: "Gabvia Blog",
        },
        headline: post.title,
        description: post.excerpt,
        url: articleUrl,
        datePublished: post.isoDate,
        dateModified: post.isoDate,
        inLanguage: "en-US",
        mainEntityOfPage: articleUrl,
        keywords: post.tags.join(", "),
        author: {
          "@type": "Person",
          name: post.author.name,
          jobTitle: post.author.role,
        },
        publisher: {
          "@type": "Organization",
          name: "Gabvia Technologies Inc.",
          url: SITE_URL,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/logo.png`,
          },
        },
        image: `${SITE_URL}/logo.png`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${SITE_URL}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.category,
            item: `${SITE_URL}/blog?category=${post.categorySlug}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: post.title,
            item: articleUrl,
          },
        ],
      },
    ],
  };

  const renderCallout = (callout: NonNullable<BlogPost["sections"][number]["callout"]>) => {
    switch (callout.type) {
      case "pain":
        return (
          <div className="my-6 rounded-2xl border border-amber-900/60 bg-amber-950/20 p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>{callout.title || "Critical Customer Pain Point"}</span>
            </div>
            <p className="text-sm text-amber-200/90 leading-relaxed">{callout.text}</p>
          </div>
        );
      case "relief":
        return (
          <div className="my-6 rounded-2xl border border-pink-900/60 bg-pink-950/20 p-5 space-y-2">
            <div className="flex items-center gap-2 text-pink-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4 text-pink-400" />
              <span>{callout.title || "Gabvia Pain Reliever"}</span>
            </div>
            <p className="text-sm text-pink-200/90 leading-relaxed">{callout.text}</p>
          </div>
        );
      case "tip":
        return (
          <div className="my-6 rounded-2xl border border-sky-900/60 bg-sky-950/20 p-5 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-sky-400" />
              <span>{callout.title || "Pro Tip"}</span>
            </div>
            <p className="text-sm text-sky-200/90 leading-relaxed">{callout.text}</p>
          </div>
        );
      case "highlight":
      default:
        return (
          <div className="my-6 rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{callout.title || "Key Takeaway"}</span>
            </div>
            <p className="text-sm text-emerald-200/90 leading-relaxed">{callout.text}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased selection:bg-zinc-800 flex flex-col">
      {/* Rich JSON-LD Schema for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BlogHeader currentCategory={post.categorySlug} />

      <main className="flex-grow">
        {/* 1. Article Header & Hero */}
        <section className="relative overflow-hidden border-b border-zinc-800/80 bg-zinc-950 pt-10 pb-12 sm:pt-14 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb nav */}
            <nav className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-6 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="text-sky-400 font-semibold">{post.category}</span>
            </nav>

            <div className="max-w-5xl xl:max-w-6xl space-y-6">
              {/* Category & Read Time meta */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                <span className="px-3 py-1 rounded-full border border-sky-800/60 bg-sky-950/60 text-sky-300 font-semibold uppercase">
                  {post.category}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  {post.publishedAt}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  {post.readTime}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.22] lg:leading-[1.18]">
                {post.title}
              </h1>

              {/* Subtitle / Lead */}
              <p className="text-base sm:text-lg lg:text-xl text-zinc-300 font-normal leading-relaxed max-w-4xl lg:max-w-5xl">
                {post.subtitle}
              </p>

              {/* Author & Share Bar */}
              <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center p-1">
                    <Image src="/logo.png" alt="Gabvia" width={26} height={26} className="object-contain" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{post.author.name}</div>
                    <div className="text-xs font-mono text-zinc-400">{post.author.role}</div>
                  </div>
                </div>

                <ArticleShareBar title={post.title} slug={post.slug} />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Article Content with 2-Column Sidebar Layout */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column: Sticky Table of Contents & Quick CTA (Desktop) */}
              <aside className="hidden lg:block lg:col-span-4 space-y-6">
                <TableOfContents items={post.tableOfContents} />

                {/* Sidebar Web Chat CTA */}
                <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                      GABVIA WEB IS LIVE
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">Experience Zero-Friction Multilingual Chat</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Message anyone across 40+ languages with in-thread AI translation and end-to-end encryption.
                  </p>
                  <Link
                    href="/chat"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Open Web Chat</span>
                  </Link>
                </div>
              </aside>

              {/* Main Column: Rich Article Content */}
              <div className="lg:col-span-8 space-y-12 max-w-3xl">
                {post.sections.map((section, idx) => (
                  <section key={section.id} id={section.id} className="scroll-mt-32 space-y-5">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight border-b border-zinc-800/80 pb-3">
                      {section.title}
                    </h2>

                    <div className="space-y-4 text-base sm:text-lg text-zinc-300 leading-relaxed">
                      {section.paragraphs.map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                    </div>

                    {/* Section Callout if present */}
                    {section.callout && renderCallout(section.callout)}

                    {/* Section Comparison Matrix (Pains vs Gains) if present */}
                    {section.comparison && (
                      <div className="my-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
                        {section.comparison.title && (
                          <h4 className="font-bold text-lg text-white font-mono text-center">
                            {section.comparison.title}
                          </h4>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          {/* Left: Pains / Old Way */}
                          <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-5 space-y-3">
                            <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-bold uppercase tracking-wider">
                              <XCircle className="w-4 h-4 text-red-400" />
                              <span>{section.comparison.leftTitle}</span>
                            </div>
                            <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
                              {section.comparison.leftItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-red-400 mt-1 font-bold">✕</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Right: Gains / Gabvia Way */}
                          <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-5 space-y-3">
                            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>{section.comparison.rightTitle}</span>
                            </div>
                            <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
                              {section.comparison.rightItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-emerald-400 mt-1 font-bold">✓</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section Point Cards if present */}
                    {section.points && section.points.length > 0 && (
                      <div className="grid grid-cols-1 gap-4 my-6">
                        {section.points.map((pt, ptIdx) => (
                          <div
                            key={ptIdx}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-1 hover:border-zinc-700 transition-colors"
                          >
                            <h4 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                              {pt.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pl-3.5">
                              {pt.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Blockquote if present */}
                    {section.quote && (
                      <blockquote className="my-8 rounded-2xl border-l-4 border-sky-500 bg-zinc-900/60 p-6 space-y-3">
                        <Quote className="w-6 h-6 text-sky-400 opacity-60" />
                        <p className="text-base sm:text-lg italic text-zinc-200 font-serif leading-relaxed">
                          &ldquo;{section.quote.text}&rdquo;
                        </p>
                        <footer className="text-xs font-mono text-zinc-400">
                          <strong className="text-zinc-200">{section.quote.author}</strong> — {section.quote.role}
                        </footer>
                      </blockquote>
                    )}
                  </section>
                ))}

                {/* Tags Cloud */}
                <div className="pt-8 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-3">
                    <Tag className="w-3.5 h-3.5 text-zinc-400" />
                    <span>ARTICLE TOPICS &amp; KEYWORDS</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-lg text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Article Footer CTA Box */}
                <div className="my-12 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/70 to-zinc-950 p-8 sm:p-10 space-y-6 shadow-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-800/60 bg-sky-950/60 font-mono text-xs text-sky-300 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>TRY GABVIA TODAY</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Start communicating freely without language friction.
                  </h3>

                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Gabvia Web is open for everyone with zero downloads. Chat in your native tongue, listen to voice note transcripts, and connect with customers, teammates, and loved ones globally.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      href="/chat"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs font-mono transition-all shadow-lg shadow-sky-500/25"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>OPEN WEB CHAT (LIVE)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <a
                      href={PLAY_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs font-mono transition-colors"
                    >
                      <GooglePlayIcon size={14} />
                      <span>DOWNLOAD FOR ANDROID</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="py-16 border-t border-zinc-800/80 bg-zinc-950/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/80">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">Related Dispatches</h3>
                <Link
                  href="/blog"
                  className="text-xs font-mono text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                >
                  <span>VIEW ALL ARTICLES</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((rel) => (
                  <div
                    key={rel.slug}
                    className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span className="text-sky-400 font-semibold">{rel.category}</span>
                        <span>{rel.readTime}</span>
                      </div>
                      <Link href={`/blog/${rel.slug}`} className="block group-hover:text-sky-400 transition-colors">
                        <h4 className="text-base font-bold text-white line-clamp-2 leading-snug">
                          {rel.title}
                        </h4>
                      </Link>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {rel.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
                      <span>{rel.publishedAt}</span>
                      <Link
                        href={`/blog/${rel.slug}`}
                        className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <BlogFooter isDark={true} />
    </div>
  );
}

