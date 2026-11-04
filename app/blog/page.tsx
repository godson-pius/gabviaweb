"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import {
  BLOG_POSTS,
  BLOG_CATEGORIES,
  BlogPost,
} from "@/lib/blog-data";
import {
  Search,
  BookOpen,
  ArrowRight,
  Clock,
  Calendar,
  Sparkles,
  Tag,
  Shield,
  HeartHandshake,
  TrendingUp,
  Cpu,
  Newspaper,
  CheckCircle2,
  Mail,
} from "lucide-react";

export default function BlogIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [subscribedEmail, setSubscribedEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "success">("idle");

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === "all" || post.categorySlug === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.subtitle.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    return BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribedEmail || !subscribedEmail.includes("@")) return;
    setSubscribeStatus("success");
    setSubscribedEmail("");
    setTimeout(() => setSubscribeStatus("idle"), 4000);
  };

  const getCategoryIcon = (categorySlug: string) => {
    switch (categorySlug) {
      case "news":
        return <Newspaper className="w-3.5 h-3.5 text-emerald-400" />;
      case "features":
        return <Cpu className="w-3.5 h-3.5 text-sky-400" />;
      case "pains-gains":
        return <TrendingUp className="w-3.5 h-3.5 text-amber-400" />;
      case "pain-relief":
        return <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />;
      case "security":
        return <Shield className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const getCategoryBadgeClass = (categorySlug: string) => {
    switch (categorySlug) {
      case "news":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-800/60";
      case "features":
        return "bg-sky-950/60 text-sky-300 border-sky-800/60";
      case "pains-gains":
        return "bg-amber-950/60 text-amber-300 border-amber-800/60";
      case "pain-relief":
        return "bg-pink-950/60 text-pink-300 border-pink-800/60";
      case "security":
        return "bg-cyan-950/60 text-cyan-300 border-cyan-800/60";
      default:
        return "bg-zinc-800/80 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased selection:bg-zinc-800 flex flex-col">
      <BlogHeader currentCategory={selectedCategory} />

      <main className="flex-grow">
        {/* 1. Blog Hero Section */}
        <section className="relative overflow-hidden border-b border-zinc-800/80 bg-zinc-950 py-16 sm:py-24">
          <div className="absolute inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] opacity-40" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 font-mono text-xs text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-sky-400 font-semibold">GABVIA EDITORIAL</span>
                <span className="text-zinc-600">|</span>
                <span className="text-zinc-400">NEWS, FEATURES &amp; PAIN RELIEF</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Real-Time Translation, <br />
                Customer Insights &amp; News.
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl">
                Explore how Gabvia eliminates the friction of cross-border communication. From product milestones and deep architectural dives to customer pain points and genuine solutions.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Search & Categories Strip */}
        <section className="border-b border-zinc-800/80 bg-zinc-900/30 sticky top-[97px] z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {BLOG_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                        isSelected
                          ? "bg-zinc-100 text-zinc-950 border-white font-bold shadow-sm"
                          : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles or topics..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-zinc-900/90 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-white font-mono"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Featured Post Hero Banner (Shows when on 'all' and no search) */}
        {selectedCategory === "all" && !searchQuery && featuredPost && (
          <section className="py-12 border-b border-zinc-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-zinc-900/40 to-zinc-950 p-8 sm:p-12 shadow-2xl group hover:border-zinc-700 transition-all">
                <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-3xl space-y-5 relative z-10">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-800/60 bg-emerald-950/60 text-emerald-300 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      FEATURED DISPATCH
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      {featuredPost.publishedAt}
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {featuredPost.readTime}
                    </span>
                  </div>

                  <Link href={`/blog/${featuredPost.slug}`}>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight group-hover:text-sky-400 transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                    {featuredPost.subtitle}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center p-1">
                        <Image src="/logo.png" alt="Gabvia" width={22} height={22} className="object-contain" />
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-zinc-200">{featuredPost.author.name}</div>
                        <div className="text-zinc-500 font-mono text-[11px]">{featuredPost.author.role}</div>
                      </div>
                    </div>

                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs font-mono transition-all group-hover:shadow-lg"
                    >
                      <span>READ FULL DISPATCH</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. Articles Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-400">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>
                  Articles ({filteredPosts.length}) {selectedCategory !== "all" && `in ${selectedCategory}`}
                </span>
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl p-8 bg-zinc-900/30">
                <Search className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-zinc-200">No articles matched your query</h3>
                <p className="text-xs text-zinc-500 font-mono mt-1">
                  Try adjusting your search terms or picking a different category filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => {
                  return (
                    <article
                      key={post.slug}
                      className="flex flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-900/40 p-7 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all shadow-sm group"
                    >
                      <div className="space-y-4">
                        {/* Meta row */}
                        <div className="flex items-center justify-between gap-2 text-xs font-mono">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${getCategoryBadgeClass(
                              post.categorySlug
                            )}`}
                          >
                            {getCategoryIcon(post.categorySlug)}
                            <span>{post.category}</span>
                          </span>

                          <span className="text-zinc-500 flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            {post.readTime}
                          </span>
                        </div>

                        {/* Title & Excerpt */}
                        <Link href={`/blog/${post.slug}`} className="block group-hover:text-sky-400 transition-colors">
                          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                            {post.title}
                          </h3>
                        </Link>

                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/60"
                            >
                              <Tag className="w-2.5 h-2.5 text-zinc-500" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer: Author & Read Link */}
                      <div className="pt-6 mt-6 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center p-0.5">
                            <Image src="/logo.png" alt="Gabvia" width={16} height={16} className="object-contain" />
                          </div>
                          <span className="text-zinc-400 truncate max-w-[120px]">{post.author.name}</span>
                        </div>

                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-1 font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                        >
                          <span>Read</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 5. Pain & Relief Highlights Matrix Banner */}
        <section className="py-16 border-t border-zinc-800/80 bg-zinc-950/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 sm:p-12">
              <div className="max-w-3xl mb-8 space-y-2">
                <span className="font-mono text-xs uppercase tracking-widest text-pink-400 block">
                  CUSTOMER EXPERIENCE ARCHITECTURE
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Why Gabvia is Built Around Pain Relief.
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  We don&apos;t just build technology for its own sake. Every feature in Gabvia is engineered to alleviate a tangible customer pain point in cross-border communication.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-950/50 border border-amber-800/50 flex items-center justify-center text-amber-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">The Pain: Copy-Paste Lag</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Toggling between translation windows and chat drains 50% of your conversation speed, creating awkward pauses in negotiations.
                  </p>
                  <div className="pt-2 text-xs font-mono text-emerald-400 font-semibold">
                    ✓ Relieved by In-Thread AI Translation
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-950/50 border border-pink-800/50 flex items-center justify-center text-pink-400">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">The Pain: Audio Barrier</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Receiving voice notes in an unfamiliar dialect leaves you helpless with standard text-only translation apps.
                  </p>
                  <div className="pt-2 text-xs font-mono text-emerald-400 font-semibold">
                    ✓ Relieved by Voice Note Transcripts
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950/50 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">The Pain: Data Harvesting</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Public search engine tools log and store your personal contracts, medical inquiries, and confidential messages.
                  </p>
                  <div className="pt-2 text-xs font-mono text-emerald-400 font-semibold">
                    ✓ Relieved by TweetNaCl E2E Encryption
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Newsletter / Updates Callout */}
        <section className="py-20 border-t border-zinc-800/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 font-mono text-xs text-zinc-400">
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>STAY INFORMED</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Get Gabvia product news delivered.
            </h2>

            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
              Join thousands of international founders, remote professionals, and diaspora members who stay up to date with new language models and platform features.
            </p>

            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                value={subscribedEmail}
                onChange={(e) => setSubscribedEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-grow px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs font-mono transition-colors shrink-0 shadow-lg shadow-sky-500/20"
              >
                SUBSCRIBE
              </button>
            </form>

            {subscribeStatus === "success" && (
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you! You are subscribed to Gabvia editorial dispatches.</span>
              </div>
            )}
          </div>
        </section>
      </main>

      <BlogFooter isDark={true} />
    </div>
  );
}

