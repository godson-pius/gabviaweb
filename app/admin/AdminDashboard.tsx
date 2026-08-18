"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

type Section = "overview" | "users" | "messaging" | "revenue" | "insights";
type TrendPoint = { label: string; activeUsers: number; messages: number; signups?: number };
type UserSummary = { id: string; name: string; username: string; language: string; points: number; status: string; createdAt: string | null; updatedAt: string | null; lastActive: string | null; messages: number; textMessages: number; voiceMessages: number; conversations: number; translations: number; referralCode: string; referredBy: string; referredById: string | null; referrals: number; bonusPlan: string; signupPosition: number | null };
type WaitlistEntry = { id: string; name: string; email: string; country: string; language: string; useCase: string; source: string; status: string; createdAt: string | null };
type InsightMetric = { label: string; value: number };
type DashboardInsights = { retention: Array<{ label: string; retained: number; eligible: number; rate: number }>; funnel: InsightMetric[]; features: InsightMetric[]; moderation: { activeUsers: number; suspendedUsers: number; reports: number | null }; system: { status: string; profileRecords: number; messageRecords: number; conversationRecords: number; translationRecords: number; paymentProviders: Array<{ name: string; configured: boolean }> } };
type AuditLog = { id: string; action: string; adminEmail: string; userId: string; createdAt: string | null };

type DashboardData = {
  adminEmail: string;
  adminRole: string;
  lastUpdated: string;
  warnings: string[];
  metrics: {
    totalUsers: number;
    dau: number;
    mau: number;
    activeRate: number;
    totalMessages: number;
    messagesThisMonth: number;
    totalConversations: number;
    groupConversations: number;
    directConversations: number;
    totalTranslations: number;
    referredUsers: number;
    totalGabPoints: number;
    grossRevenue: number;
    settledRevenue: number;
    paidTransactions: number;
    waitlistCount: number;
  };
  trends: {
    daily: TrendPoint[];
    monthly: TrendPoint[];
    revenue: Array<{ month: string; label: string; gross: number; settled: number; count: number }>;
  };
  breakdowns: {
    languages: Array<{ name: string; users: number }>;
    providers: Array<{ provider: string; transactions: number; gross: number; settled: number }>;
  };
  recentUsers: UserSummary[];
  users: UserSummary[];
  waitlist: WaitlistEntry[];
  insights: DashboardInsights;
  auditLogs: AuditLog[];
};

const emptyData: DashboardData = {
  adminEmail: "",
  adminRole: "owner",
  lastUpdated: "",
  warnings: [],
  metrics: { totalUsers: 0, dau: 0, mau: 0, activeRate: 0, totalMessages: 0, messagesThisMonth: 0, totalConversations: 0, groupConversations: 0, directConversations: 0, totalTranslations: 0, referredUsers: 0, totalGabPoints: 0, grossRevenue: 0, settledRevenue: 0, paidTransactions: 0, waitlistCount: 0 },
  trends: { daily: [], monthly: [], revenue: [] },
  breakdowns: { languages: [], providers: [] },
  recentUsers: [],
  users: [],
  waitlist: [],
  insights: { retention: [], funnel: [], features: [], moderation: { activeUsers: 0, suspendedUsers: 0, reports: null }, system: { status: "unknown", profileRecords: 0, messageRecords: 0, conversationRecords: 0, translationRecords: 0, paymentProviders: [] } },
  auditLogs: [],
};

type IconName = "grid" | "users" | "message" | "wallet" | "settings" | "bell" | "search" | "arrow" | "trend" | "download" | "logout" | "refresh" | "globe" | "mic" | "close";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    message: <><path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.7 9.7 0 0 1-4-.8L3 21l1.8-4.1A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
    wallet: <><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 16.5v-9Z" /><path d="M3 8h16M16 14h.01" /></>,
    settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="m19.4 15 .1.1-1.4 2.4-.2-.1a2 2 0 0 0-2.3.2l-.2.2a2 2 0 0 0-.5 2.1v.2h-2.8v-.2a2 2 0 0 0-1.5-2.3l-.2-.1a2 2 0 0 0-2.1.5l-.1.1-1.4-2.4.2-.1a2 2 0 0 0 .8-2.1v-.2a2 2 0 0 0-1.6-1.6H6V9h.2a2 2 0 0 0 1.6-1.5v-.2A2 2 0 0 0 7 5.2l-.2-.1L8.2 2.7l.1.1a2 2 0 0 0 2.1.5l.2-.1a2 2 0 0 0 1.5-2.3V.7h2.8v.2a2 2 0 0 0 .5 2.3l.2.1a2 2 0 0 0 2.3-.2l.2-.1 1.4 2.4-.1.1a2 2 0 0 0-.8 2.1v.2a2 2 0 0 0 1.6 1.6h.2v2.8h-.2a2 2 0 0 0-1.6 1.6v.2a2 2 0 0 0 .8 2.1Z" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M4 21h16" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-5" /></>,
    refresh: <><path d="M20 11a8 8 0 1 0 1 5" /><path d="M20 4v7h-7" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: value > 9999 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "—";
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const escape = (value: string | number) => `"${String(value).replaceAll("\"", "\"\"")}"`;
  const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function LineChart({ data, dataKey, color = "#287dff", height = 210 }: { data: TrendPoint[]; dataKey: "activeUsers" | "messages"; color?: string; height?: number }) {
  const values = data.map((point) => point[dataKey]);
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - (value / max) * 82 - 9}`).join(" ");
  return <div className="admin-chart-wrap"><svg className="admin-line-chart" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height }} role="img" aria-label={`${dataKey} trend`}><line x1="0" y1="9" x2="100" y2="9" /><line x1="0" y1="50" x2="100" y2="50" /><line x1="0" y1="91" x2="100" y2="91" /><polyline points={points} fill="none" stroke={color} strokeWidth="1.7" vectorEffect="non-scaling-stroke" /></svg><div className="chart-labels"><span>{data[0]?.label ?? "—"}</span><span>{data[Math.floor(data.length / 2)]?.label ?? "—"}</span><span>{data[data.length - 1]?.label ?? "—"}</span></div></div>;
}

function StatCard({ label, value, change, icon, tone = "blue" }: { label: string; value: string; change?: string; icon: IconName; tone?: string }) {
  return <div className={`admin-stat-card ${tone}`}><div className="stat-card-top"><span>{label}</span><span className="stat-icon"><Icon name={icon} size={17} /></span></div><strong>{value}</strong>{change && <small><Icon name="trend" size={12} /> {change}</small>}</div>;
}

export default function AdminDashboard({ firebaseApiKey }: { firebaseApiKey: string }) {
  const [section, setSection] = useState<Section>("overview");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [dataError, setDataError] = useState("");
  const [period, setPeriod] = useState<"daily" | "monthly">("daily");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const loadAnalytics = async (idToken: string) => {
    setLoadingData(true);
    setDataError("");
    try {
      const response = await fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${idToken}` }, cache: "no-store" });
      const payload = await response.json() as DashboardData & { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Could not load analytics.");
      setData({ ...payload, adminRole: payload.adminRole ?? "owner", metrics: { ...emptyData.metrics, ...payload.metrics }, users: payload.users ?? payload.recentUsers ?? [], waitlist: payload.waitlist ?? [], insights: payload.insights ?? emptyData.insights, auditLogs: payload.auditLogs ?? [] });
      setAdminEmail(payload.adminEmail);
      sessionStorage.setItem("gabvia_admin_token", idToken);
    } catch (loadError) {
      setDataError(loadError instanceof Error ? loadError.message : "Could not load analytics.");
      if (String(loadError).toLowerCase().includes("session") || String(loadError).toLowerCase().includes("allowlist")) setToken("");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    const savedToken = sessionStorage.getItem("gabvia_admin_token");
    if (!savedToken) return;
    const timer = window.setTimeout(() => {
      setToken(savedToken);
      void loadAnalytics(savedToken);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!firebaseApiKey) throw new Error("Firebase API configuration is missing from the web environment.");
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, returnSecureToken: true }) });
      const payload = await response.json() as { idToken?: string; email?: string; error?: { message?: string } };
      if (!response.ok || !payload.idToken) throw new Error(payload.error?.message?.replaceAll("_", " ").toLowerCase() ?? "Could not sign in.");
      setToken(payload.idToken);
      setAdminEmail(payload.email ?? email);
      setPassword("");
      await loadAnalytics(payload.idToken);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("gabvia_admin_token");
    setToken("");
    setAdminEmail("");
    setData(emptyData);
  };

  const handleAccountAction = async (userId: string, action: "suspend" | "restore" | "delete", confirmation?: string) => {
    setLoadingData(true);
    setDataError("");
    try {
      const response = await fetch("/api/admin/user-actions", { method: action === "delete" ? "DELETE" : "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ userId, action, confirmation }) });
      const payload = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Could not update the account.");
      await loadAnalytics(token);
    } catch (actionError) {
      setDataError(actionError instanceof Error ? actionError.message : "Could not update the account.");
    } finally {
      setLoadingData(false);
    }
  };

  if (!token) return <LoginScreen apiKeyConfigured={Boolean(firebaseApiKey)} email={email} password={password} error={error || dataError} loading={loading} setEmail={setEmail} setPassword={setPassword} onSubmit={handleLogin} />;

  const activeTrend = period === "daily" ? data.trends.daily : data.trends.monthly;
  const maxLanguageUsers = Math.max(...data.breakdowns.languages.map((item) => item.users), 1);
  const maxRevenue = Math.max(...data.trends.revenue.map((item) => item.gross), 1);

  return <div className="admin-app"><aside className="admin-sidebar"><div className="admin-brand"><Image src="/logo.png" alt="" width={31} height={31} /><span>gabvia</span><b>ADMIN</b></div><div className="admin-workspace"><span className="workspace-avatar">G</span><span><strong>Gabvia HQ</strong><small>Analytics workspace</small></span><span className="workspace-chevron">⌄</span></div><nav className="admin-nav" aria-label="Admin navigation"><p>Workspace</p>{([["overview", "Overview", "grid"], ["users", "Users", "users"], ["messaging", "Messaging", "message"], ["revenue", "Revenue", "wallet"], ["insights", "Insights", "trend"]] as [Section, string, IconName][]).map(([key, label, icon]) => <button className={section === key ? "active" : ""} key={key} onClick={() => setSection(key)}><Icon name={icon} size={17} /><span>{label}</span>{key === "users" && <em>{formatNumber(data.metrics.totalUsers)}</em>}</button>)}</nav><nav className="admin-nav admin-nav-secondary" aria-label="Settings navigation"><p>Manage</p><button onClick={() => setDataError("Settings are managed in the Gabvia project configuration.")}><Icon name="settings" size={17} /><span>Settings</span></button><button onClick={() => setDataError(data.warnings.length ? data.warnings.join(" · ") : "No active alerts.")}><Icon name="bell" size={17} /><span>Alerts</span><i className="alert-dot" /></button></nav><div className="sidebar-bottom"><div className="admin-user"><span className="admin-user-avatar">{(adminEmail || "A").slice(0, 1).toUpperCase()}</span><span><strong>{adminEmail || "Admin"}</strong><small>{data.adminRole} role</small></span></div><button className="logout-button" aria-label="Sign out" onClick={logout}><Icon name="logout" size={16} /></button></div></aside><main className="admin-main"><header className="admin-header"><div><div className="admin-breadcrumb">Workspace <span>/</span> <b>{section[0].toUpperCase() + section.slice(1)}</b></div><h1>{section === "overview" ? "Good morning, admin" : `${section[0].toUpperCase() + section.slice(1)} analytics`}</h1><p>{section === "overview" ? "Here&apos;s what&apos;s happening across Gabvia today." : `A closer look at Gabvia ${section} and the signals that matter.`}</p></div><div className="admin-header-actions"><button className="icon-button" onClick={() => { setSearchOpen(true); setNotificationsOpen(false); }} aria-label="Search users"><Icon name="search" size={17} /></button><button className="icon-button notification-button" onClick={() => { setNotificationsOpen(true); setSearchOpen(false); }} aria-label="Show alerts"><Icon name="bell" size={17} /><i /></button><button className="admin-refresh" onClick={() => void loadAnalytics(token)} disabled={loadingData}><Icon name="refresh" size={15} /> {loadingData ? "Refreshing" : "Refresh data"}</button></div></header>{dataError && <div className="admin-alert error"><span>!</span><p>{dataError}</p><button onClick={() => { setDataError(""); void loadAnalytics(token); }}>Retry</button></div>}{data.warnings.length > 0 && <div className="admin-alert warning"><span>i</span><p>Some payment providers could not be reached. Product analytics are still live.</p><small>{data.warnings.join(" · ")}</small></div>}{section === "overview" && <Overview data={data} activeTrend={activeTrend} period={period} setPeriod={setPeriod} maxLanguageUsers={maxLanguageUsers} setSection={setSection} />}{section === "users" && <UsersSection data={data} activeTrend={activeTrend} period={period} setPeriod={setPeriod} onAccountAction={handleAccountAction} />}{section === "messaging" && <MessagingSection data={data} activeTrend={activeTrend} period={period} setPeriod={setPeriod} />}{section === "revenue" && <RevenueSection data={data} maxRevenue={maxRevenue} />}{section === "insights" && <InsightsSection data={data} />}{searchOpen && <AdminSearchModal users={data.users ?? []} onClose={() => setSearchOpen(false)} onOpenUsers={() => { setSection("users"); setSearchOpen(false); }} />}{notificationsOpen && <AdminNotificationsModal data={data} onClose={() => setNotificationsOpen(false)} />}</main></div>;
}

function LoginScreen({ apiKeyConfigured, email, password, error, loading, setEmail, setPassword, onSubmit }: { apiKeyConfigured: boolean; email: string; password: string; error: string; loading: boolean; setEmail: (value: string) => void; setPassword: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <main className="admin-login-page"><div className="admin-login-orbit orbit-left" /><div className="admin-login-orbit orbit-right" /><div className="admin-login-card"><div className="admin-login-brand"><Image src="/logo.png" alt="" width={45} height={45} /><span>gabvia</span></div><div className="admin-login-kicker">Private workspace</div><h1>Welcome back.</h1><p>Sign in to see how Gabvia is growing.</p><form onSubmit={onSubmit}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@gabvia.app" required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required autoComplete="current-password" /></label>{error && <div className="login-error">{error}</div>}{!apiKeyConfigured && <div className="login-error">Firebase API configuration is missing from `gabviaweb/.env`.</div>}<button className="login-button" type="submit" disabled={loading || !apiKeyConfigured}>{loading ? "Signing in…" : "Sign in to dashboard"}<Icon name="arrow" size={17} /></button></form><small className="login-footnote">Admin access is restricted to approved Firebase accounts.</small></div><div className="login-logo-word">gabvia <span>analytics</span></div></main>;
}

function AdminSearchModal({ users, onClose, onOpenUsers }: { users: UserSummary[]; onClose: () => void; onOpenUsers: () => void }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const results = users.filter((user) => `${user.name} ${user.username} ${user.language} ${user.id}`.toLowerCase().includes(normalizedQuery)).slice(0, 8);
  return <div className="admin-utility-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="admin-utility-modal" role="dialog" aria-modal="true" aria-labelledby="admin-search-title"><button className="admin-modal-close" onClick={onClose} aria-label="Close search"><Icon name="close" size={17} /></button><span className="utility-kicker">Directory search</span><h2 id="admin-search-title">Find a user</h2><div className="utility-search-input"><Icon name="search" size={16} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, username, language, or ID" /></div><div className="utility-results">{results.length === 0 ? <EmptyState text={normalizedQuery ? "No matching users found." : "Start typing to search all users."} /> : results.map((user) => <button className="utility-user-result" key={user.id} onClick={onOpenUsers}><span className="table-avatar">{user.name.slice(0, 1).toUpperCase()}</span><span><strong>{user.name}</strong><small>@{user.username} · {user.language}</small></span><Icon name="arrow" size={14} /></button>)}</div><button className="utility-secondary-action" onClick={onOpenUsers}>Open full users directory <Icon name="arrow" size={14} /></button></section></div>;
}

function AdminNotificationsModal({ data, onClose }: { data: DashboardData; onClose: () => void }) {
  const systemStatus = data.insights?.system?.status ?? "unknown";
  const auditLogs = data.auditLogs ?? [];
  return <div className="admin-utility-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="admin-utility-modal notification-modal" role="dialog" aria-modal="true" aria-labelledby="admin-notifications-title"><button className="admin-modal-close" onClick={onClose} aria-label="Close notifications"><Icon name="close" size={17} /></button><span className="utility-kicker">Workspace activity</span><h2 id="admin-notifications-title">Notifications</h2><div className={`notification-health ${systemStatus}`}><span className="notification-health-dot" /><span><strong>System health: {systemStatus}</strong><small>{data.lastUpdated ? `Last checked ${formatDate(data.lastUpdated)}` : "Waiting for the first data refresh"}</small></span></div>{data.warnings.length > 0 ? <div className="notification-group"><span className="notification-group-title">Needs attention</span>{data.warnings.map((warning) => <div className="notification-item warning-item" key={warning}><span>!</span><p>{warning}</p></div>)}</div> : <div className="notification-item success-item"><span>✓</span><p>No active system warnings.</p></div>}<div className="notification-group"><span className="notification-group-title">Recent admin actions</span>{auditLogs.length === 0 ? <EmptyState text="No recent account actions." /> : auditLogs.slice(0, 5).map((entry) => <div className="notification-item" key={entry.id}><span>•</span><p><b>{entry.action}</b> account action by {entry.adminEmail}<small>{formatDate(entry.createdAt)}</small></p></div>)}</div></section></div>;
}

function Overview({ data, activeTrend, period, setPeriod, maxLanguageUsers, setSection }: { data: DashboardData; activeTrend: TrendPoint[]; period: "daily" | "monthly"; setPeriod: (period: "daily" | "monthly") => void; maxLanguageUsers: number; setSection: (section: Section) => void }) {
  return <><div className="stat-grid"><StatCard label="Total users" value={formatNumber(data.metrics.totalUsers)} change={`${formatNumber(data.metrics.referredUsers)} referred`} icon="users" /><StatCard label="Daily active users" value={formatNumber(data.metrics.dau)} change={`${data.metrics.activeRate}% of MAU`} icon="trend" tone="green" /><StatCard label="Monthly active users" value={formatNumber(data.metrics.mau)} change="Last 30 days" icon="grid" tone="violet" /><StatCard label="Gross revenue" value={formatMoney(data.metrics.grossRevenue)} change={`${formatNumber(data.metrics.paidTransactions)} paid transactions`} icon="wallet" tone="yellow" /></div><div className="admin-two-column"><section className="admin-panel engagement-panel"><PanelHeading eyebrow="Engagement" title="Active users" action={<div className="period-switch"><button className={period === "daily" ? "selected" : ""} onClick={() => setPeriod("daily")}>30 days</button><button className={period === "monthly" ? "selected" : ""} onClick={() => setPeriod("monthly")}>12 months</button></div>} /><div className="big-chart-stat"><strong>{formatNumber(period === "daily" ? data.metrics.mau : data.trends.monthly.reduce((sum, item) => sum + (item.activeUsers > 0 ? 1 : 0), 0))}</strong><span><i className="positive-dot" /> Unique active users</span></div><LineChart data={activeTrend} dataKey="activeUsers" /></section><section className="admin-panel language-panel"><PanelHeading eyebrow="Audience" title="Top languages" action={<Icon name="globe" size={17} />} /><div className="language-list">{data.breakdowns.languages.map((language) => <div className="language-row" key={language.name}><div className="language-label"><span>{language.name}</span><b>{formatNumber(language.users)}</b></div><div className="language-bar"><i style={{ width: `${(language.users / maxLanguageUsers) * 100}%` }} /></div></div>)}{data.breakdowns.languages.length === 0 && <EmptyState text="No user language data yet." />}</div></section></div><div className="admin-two-column lower-grid"><section className="admin-panel"><PanelHeading eyebrow="Users" title="New arrivals" action={<button className="panel-link" onClick={() => setSection("users")}>View all <Icon name="arrow" size={13} /></button>} /><UserTable users={data.recentUsers.slice(0, 5)} /></section><section className="admin-panel quick-panel"><PanelHeading eyebrow="Product pulse" title="At a glance" /><div className="pulse-grid"><div><span><Icon name="message" size={14} /> Messages this month</span><strong>{formatNumber(data.metrics.messagesThisMonth)}</strong></div><div><span><Icon name="grid" size={14} /> Conversations</span><strong>{formatNumber(data.metrics.totalConversations)}</strong></div><div><span><Icon name="mic" size={14} /> Translations</span><strong>{formatNumber(data.metrics.totalTranslations)}</strong></div><div><span><Icon name="wallet" size={14} /> Settled revenue</span><strong>{formatMoney(data.metrics.settledRevenue)}</strong></div><div><span><Icon name="users" size={14} /> Early access</span><strong>{formatNumber(data.metrics.waitlistCount)}</strong></div></div></section></div><WaitlistPanel entries={data.waitlist} /></>;
}

function UsersSection({ data, activeTrend, period, setPeriod, onAccountAction }: { data: DashboardData; activeTrend: TrendPoint[]; period: "daily" | "monthly"; setPeriod: (period: "daily" | "monthly") => void; onAccountAction: (userId: string, action: "suspend" | "restore" | "delete", confirmation?: string) => Promise<void> }) {
  const allUsers = data.users ?? data.recentUsers ?? [];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const filteredUsers = allUsers.filter((user) => `${user.name} ${user.username} ${user.language}`.toLowerCase().includes(search.toLowerCase()) && (statusFilter === "all" || (statusFilter === "suspended" ? user.status === "suspended" : user.status !== "suspended")));
  const selectedUser = allUsers.find((user) => user.id === selectedUserId) ?? null;
  return <><div className="stat-grid"><StatCard label="Total users" value={formatNumber(data.metrics.totalUsers)} change="All time" icon="users" /><StatCard label="Daily active users" value={formatNumber(data.metrics.dau)} change="Today" icon="trend" tone="green" /><StatCard label="Monthly active users" value={formatNumber(data.metrics.mau)} change="Last 30 days" icon="grid" tone="violet" /><StatCard label="Referral signups" value={formatNumber(data.metrics.referredUsers)} change={`${data.metrics.totalUsers ? Math.round((data.metrics.referredUsers / data.metrics.totalUsers) * 100) : 0}% of users`} icon="arrow" tone="yellow" /></div><section className="admin-panel full-panel"><PanelHeading eyebrow="Retention signal" title="User activity" action={<div className="period-switch"><button className={period === "daily" ? "selected" : ""} onClick={() => setPeriod("daily")}>30 days</button><button className={period === "monthly" ? "selected" : ""} onClick={() => setPeriod("monthly")}>12 months</button></div>} /><LineChart data={activeTrend} dataKey="activeUsers" height={280} /></section><div className="user-directory-grid"><section className="admin-panel"><PanelHeading eyebrow="Directory" title="All users" action={<div className="directory-actions"><button className="panel-link" onClick={() => downloadCsv("gabvia-users.csv", ["Name", "Username", "Language", "Messages", "Conversations", "Joined"], filteredUsers.map((user) => [user.name, user.username, user.language, user.messages, user.conversations, formatDate(user.createdAt)]))}><Icon name="download" size={13} /> Export</button><select className="directory-status-filter" aria-label="Filter users by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "suspended")}><option value="all">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option></select><span className="directory-count">{formatNumber(filteredUsers.length)} shown</span></div>} /><div className="user-search"><Icon name="search" size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, username, or language" /></div><UserTable users={filteredUsers} onSelect={(user) => setSelectedUserId(user.id)} selectedUserId={selectedUserId ?? undefined} /></section></div><UserDetailsModal user={selectedUser} onClose={() => setSelectedUserId(null)} onAccountAction={onAccountAction} /></>;
}

function InsightsSection({ data }: { data: DashboardData }) {
  const insights = data.insights ?? emptyData.insights;
  const retention = insights.retention ?? [];
  const funnel = insights.funnel ?? [];
  const features = insights.features ?? [];
  const maxFunnel = Math.max(...funnel.map((item) => item.value), 1);
  const maxFeature = Math.max(...features.map((item) => item.value), 1);
  const moderation = { ...emptyData.insights.moderation, ...(insights.moderation ?? {}) };
  const system = { ...emptyData.insights.system, ...(insights.system ?? {}), paymentProviders: insights.system?.paymentProviders ?? emptyData.insights.system.paymentProviders };
  const auditLogs = data.auditLogs ?? [];
  return <><div className="stat-grid">{retention.map((item) => <StatCard key={item.label} label={`${item.label} retention`} value={`${item.rate}%`} change={`${formatNumber(item.retained)} of ${formatNumber(item.eligible)} eligible`} icon="trend" tone={item.label === "D1" ? "green" : item.label === "D7" ? "violet" : "yellow"} />)}<StatCard label="Suspended accounts" value={formatNumber(moderation.suspendedUsers)} change={`${formatNumber(moderation.activeUsers)} active profiles`} icon="users" tone="yellow" /></div><div className="admin-two-column"><section className="admin-panel"><PanelHeading eyebrow="Retention" title="Cohort return rate" /><div className="retention-list">{retention.map((item) => <div className="retention-row" key={item.label}><div><strong>{item.label}</strong><span>{formatNumber(item.retained)} returned users</span></div><b>{item.rate}%</b><div className="retention-bar"><i style={{ width: `${item.rate}%` }} /></div></div>)}{retention.length === 0 && <EmptyState text="Retention data will appear as users create activity." />}</div></section><section className="admin-panel"><PanelHeading eyebrow="Activation" title="User funnel" /><div className="funnel-list">{funnel.map((item, index) => <div className="funnel-row" key={item.label}><div className="funnel-label"><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.label}</strong><b>{formatNumber(item.value)}</b></div><div className="funnel-bar"><i style={{ width: `${(item.value / maxFunnel) * 100}%` }} /></div></div>)}</div></section></div><div className="admin-two-column"><section className="admin-panel"><PanelHeading eyebrow="Product pulse" title="Feature usage" /><div className="feature-usage-list">{features.map((item) => <div className="feature-usage-row" key={item.label}><div><span>{item.label}</span><b>{formatNumber(item.value)}</b></div><div className="feature-usage-bar"><i style={{ width: `${(item.value / maxFeature) * 100}%` }} /></div></div>)}</div></section><section className="admin-panel"><PanelHeading eyebrow="Trust & safety" title="Account health" /><div className="health-summary"><div><span>Active profiles</span><strong>{formatNumber(moderation.activeUsers)}</strong></div><div className="health-danger"><span>Suspended</span><strong>{formatNumber(moderation.suspendedUsers)}</strong></div><div><span>Reports</span><strong>{moderation.reports === null ? "Unavailable" : formatNumber(moderation.reports)}</strong></div></div><p className="panel-note">Reports are loaded from the product reports collection and can be reviewed when reports exist.</p></section></div><section className="admin-panel system-health-panel"><PanelHeading eyebrow="Operations" title="System health" action={<span className={`health-status ${system.status}`}>{system.status}</span>} /><div className="system-health-grid"><div><span>Profiles</span><strong>{formatNumber(system.profileRecords)}</strong></div><div><span>Messages</span><strong>{formatNumber(system.messageRecords)}</strong></div><div><span>Conversations</span><strong>{formatNumber(system.conversationRecords)}</strong></div><div><span>Translations</span><strong>{formatNumber(system.translationRecords)}</strong></div>{system.paymentProviders.map((provider) => <div key={provider.name}><span>{provider.name}</span><strong className={provider.configured ? "provider-ok" : "provider-offline"}>{provider.configured ? "Configured" : "Not configured"}</strong></div>)}</div></section><section className="admin-panel audit-panel"><PanelHeading eyebrow="Security" title="Admin audit log" action={<span className="directory-count">{formatNumber(auditLogs.length)} recent events</span>} />{auditLogs.length === 0 ? <EmptyState text="No account actions have been recorded yet." /> : <div className="audit-list">{auditLogs.map((entry) => <div className="audit-row" key={entry.id}><span className={`audit-action ${entry.action}`}>{entry.action}</span><div><strong>{entry.adminEmail}</strong><small>Target: {entry.userId}</small></div><time>{formatDate(entry.createdAt)}</time></div>)}</div>}</section></>;
}

function MessagingSection({ data, activeTrend, period, setPeriod }: { data: DashboardData; activeTrend: TrendPoint[]; period: "daily" | "monthly"; setPeriod: (period: "daily" | "monthly") => void }) {
  return <><div className="stat-grid"><StatCard label="All messages" value={formatNumber(data.metrics.totalMessages)} change="Across all conversations" icon="message" /><StatCard label="This month" value={formatNumber(data.metrics.messagesThisMonth)} change="Message volume" icon="trend" tone="green" /><StatCard label="Translations" value={formatNumber(data.metrics.totalTranslations)} change="Translation jobs" icon="globe" tone="violet" /><StatCard label="Conversations" value={formatNumber(data.metrics.totalConversations)} change={`${formatNumber(data.metrics.groupConversations)} groups`} icon="users" tone="yellow" /></div><section className="admin-panel full-panel"><PanelHeading eyebrow="Usage" title="Message volume" action={<div className="period-switch"><button className={period === "daily" ? "selected" : ""} onClick={() => setPeriod("daily")}>30 days</button><button className={period === "monthly" ? "selected" : ""} onClick={() => setPeriod("monthly")}>12 months</button></div>} /><div className="big-chart-stat"><strong>{formatNumber(data.metrics.messagesThisMonth)}</strong><span><Icon name="message" size={13} /> messages this month</span></div><LineChart data={activeTrend} dataKey="messages" color="#32b99a" height={280} /></section><div className="admin-two-column"><section className="admin-panel conversation-breakdown"><PanelHeading eyebrow="Conversation mix" title="How people connect" /><div className="donut-row"><div className="donut" style={{ background: `conic-gradient(#287dff 0 ${data.metrics.totalConversations ? (data.metrics.directConversations / data.metrics.totalConversations) * 100 : 0}%, #d8c4ff 0 100%)` }}><div>{formatNumber(data.metrics.totalConversations)}</div></div><div className="donut-legend"><span><i className="blue-dot" /> Direct <b>{formatNumber(data.metrics.directConversations)}</b></span><span><i className="violet-dot" /> Groups <b>{formatNumber(data.metrics.groupConversations)}</b></span></div></div></section><section className="admin-panel"><PanelHeading eyebrow="Economy" title="Gab points in circulation" /><div className="economy-number">{formatNumber(data.metrics.totalGabPoints)} <small>GAB</small></div><p className="panel-note">Points currently held across user profiles. Purchases are converted into points in the app.</p></section></div></>;
}

function RevenueSection({ data, maxRevenue }: { data: DashboardData; maxRevenue: number }) {
  return <><div className="stat-grid"><StatCard label="Gross revenue" value={formatMoney(data.metrics.grossRevenue)} change="Last 12 months" icon="wallet" tone="yellow" /><StatCard label="Settled revenue" value={formatMoney(data.metrics.settledRevenue)} change="After provider fees" icon="trend" tone="green" /><StatCard label="Paid transactions" value={formatNumber(data.metrics.paidTransactions)} change="Successful payments" icon="message" /><StatCard label="Average payment" value={formatMoney(data.metrics.paidTransactions ? data.metrics.grossRevenue / data.metrics.paidTransactions : 0)} change="Per successful payment" icon="arrow" tone="violet" /></div><section className="admin-panel full-panel"><PanelHeading eyebrow="Monetization" title="Revenue by month" action={<button className="panel-link" onClick={() => downloadCsv("gabvia-revenue.csv", ["Month", "Gross", "Settled", "Transactions"], data.trends.revenue.map((month) => [month.month, month.gross, month.settled, month.count]))}><Icon name="download" size={13} /> Export</button>} /><div className="revenue-bars">{data.trends.revenue.map((month) => <div className="revenue-bar-column" key={month.month}><div className="revenue-bar-value">{month.gross ? formatMoney(month.gross) : "—"}</div><div className="revenue-bar" style={{ height: `${Math.max((month.gross / maxRevenue) * 180, month.gross ? 8 : 2)}px` }} /><span>{month.label}</span></div>)}</div></section><div className="admin-two-column"><section className="admin-panel"><PanelHeading eyebrow="Providers" title="Payment performance" /><div className="provider-list">{data.breakdowns.providers.map((provider) => <div className="provider-row" key={provider.provider}><span className={`provider-logo ${provider.provider.toLowerCase()}`}>{provider.provider.slice(0, 1)}</span><div><strong>{provider.provider}</strong><small>{formatNumber(provider.transactions)} transactions</small></div><b>{formatMoney(provider.gross)}</b></div>)}</div></section><section className="admin-panel finance-note"><PanelHeading eyebrow="Revenue tracking" title="Keep your numbers honest" /><p>Revenue is pulled from the provider transaction APIs using server-side credentials. For long-term reporting, persist every verified payment in a dedicated transactions collection as part of the payment webhook flow.</p><span><Icon name="trend" size={14} /> Gross and settled totals shown in NGN</span></section></div></>;
}

function PanelHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="panel-heading"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action}</div>;
}

function UserTable({ users, onSelect, selectedUserId }: { users: UserSummary[]; onSelect?: (user: UserSummary) => void; selectedUserId?: string }) {
  if (users.length === 0) return <EmptyState text="No users found yet." />;
  return <div className="user-table"><div className="user-table-header"><span>User</span><span>Language</span><span>Messages</span><span>Joined</span></div>{users.map((user) => <button className={`user-table-row ${selectedUserId === user.id ? "selected" : ""}`} key={user.id} onClick={() => onSelect?.(user)}><div className="table-user"><span className="table-avatar">{user.name.slice(0, 1).toUpperCase()}</span><span><strong>{user.name}</strong><small>@{user.username}</small></span></div><span>{user.language}</span><b>{formatNumber(user.messages)}</b><span>{formatDate(user.createdAt)}</span></button>)}</div>;
}

type AccountAction = "suspend" | "restore" | "delete";

function UserDetailsModal({ user, onClose, onAccountAction }: { user: UserSummary | null; onClose: () => void; onAccountAction: (userId: string, action: AccountAction, confirmation?: string) => Promise<void> }) {
  const [confirmAction, setConfirmAction] = useState<AccountAction | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  if (!user) return null;
  const isSuspended = user.status === "suspended";
  const closeConfirmation = () => { setConfirmAction(null); setDeleteConfirmation(""); };
  const closeModal = () => { closeConfirmation(); onClose(); };
  const confirmAccountAction = async () => {
    if (!confirmAction || (confirmAction === "delete" && deleteConfirmation !== "DELETE")) return;
    const action = confirmAction;
    await onAccountAction(user.id, action, action === "delete" ? deleteConfirmation : undefined);
    closeConfirmation();
    if (action === "delete") onClose();
  };
  return <div className="admin-detail-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}><section className="user-details-modal" role="dialog" aria-modal="true" aria-labelledby="user-details-title"><button className="admin-modal-close" onClick={closeModal} aria-label="Close user details"><Icon name="close" size={17} /></button><div className="user-detail-top"><span className="user-detail-avatar">{user.name.slice(0, 1).toUpperCase()}</span><div><span className="detail-kicker">User profile</span><h2 id="user-details-title">{user.name}</h2><p>@{user.username}</p></div><span className={`user-status ${isSuspended ? "suspended" : ""}`}>{isSuspended ? "Suspended" : "Active profile"}</span></div><div className="user-detail-id">ID <code>{user.id}</code></div><div className="detail-stat-grid"><div><span>Messages</span><strong>{formatNumber(user.messages)}</strong></div><div><span>Conversations</span><strong>{formatNumber(user.conversations)}</strong></div><div><span>Voice notes</span><strong>{formatNumber(user.voiceMessages)}</strong></div><div><span>Translations</span><strong>{formatNumber(user.translations)}</strong></div></div><div className="detail-section"><span className="detail-kicker">Profile</span><DetailRow label="Language" value={user.language} /><DetailRow label="GAB points" value={formatNumber(user.points)} /><DetailRow label="Bonus plan" value={user.bonusPlan} /><DetailRow label="Signup position" value={user.signupPosition ? `#${user.signupPosition}` : "—"} /><DetailRow label="Joined" value={formatDate(user.createdAt)} /><DetailRow label="Last active" value={formatDate(user.lastActive)} /></div><div className="detail-section"><span className="detail-kicker">Referrals</span><DetailRow label="Referred by" value={user.referredBy} /><DetailRow label="Referrer ID" value={user.referredById ?? "—"} /><DetailRow label="Referral code" value={user.referralCode} /><DetailRow label="Users referred" value={formatNumber(user.referrals)} /></div><div className="detail-section"><span className="detail-kicker">Message breakdown</span><DetailRow label="Text messages" value={formatNumber(user.textMessages)} /><DetailRow label="Voice messages" value={formatNumber(user.voiceMessages)} /></div><div className="modal-action-footer"><button className="account-suspend-button" onClick={() => setConfirmAction(isSuspended ? "restore" : "suspend")}>{isSuspended ? "Restore account" : "Suspend account"}</button><button className="account-delete-button" onClick={() => setConfirmAction("delete")}>Delete account</button></div></section>{confirmAction && <AccountConfirmationModal action={confirmAction} user={user} deleteConfirmation={deleteConfirmation} setDeleteConfirmation={setDeleteConfirmation} onCancel={closeConfirmation} onConfirm={() => void confirmAccountAction()} />}</div>;
}

function AccountConfirmationModal({ action, user, deleteConfirmation, setDeleteConfirmation, onCancel, onConfirm }: { action: AccountAction; user: UserSummary; deleteConfirmation: string; setDeleteConfirmation: (value: string) => void; onCancel: () => void; onConfirm: () => void }) {
  const isDelete = action === "delete";
  const isRestore = action === "restore";
  const title = isDelete ? "Delete this account permanently?" : isRestore ? "Restore this account?" : "Suspend this account?";
  const description = isDelete ? "This removes the Firebase Auth account and its profile permanently. Shared conversations and messages will not be removed." : isRestore ? "This account will be allowed to sign in and use Gabvia again." : "The user will be signed out and blocked from signing in until the account is restored.";
  const actionLabel = isDelete ? "Delete permanently" : isRestore ? "Restore account" : "Suspend account";
  return <div className="account-confirm-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}><section className={`account-confirm-modal ${isDelete ? "danger" : isRestore ? "restore" : "suspend"}`} role="alertdialog" aria-modal="true" aria-labelledby="account-confirm-title"><div className="account-confirm-icon"><Icon name={isDelete ? "close" : "users"} size={20} /></div><h3 id="account-confirm-title">{title}</h3><p>{description}</p><div className="account-confirm-user"><span className="table-avatar">{user.name.slice(0, 1).toUpperCase()}</span><span><strong>{user.name}</strong><small>@{user.username}</small></span></div>{isDelete && <label className="account-confirm-label">Type <b>DELETE</b> to confirm<input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} placeholder="DELETE" autoComplete="off" autoFocus /></label>}<div className="account-confirm-actions"><button onClick={onCancel}>Cancel</button><button className={isDelete ? "confirm-danger" : "confirm-primary"} disabled={isDelete && deleteConfirmation !== "DELETE"} onClick={onConfirm}>{actionLabel}</button></div></section></div>;
}

function DetailRow({ label, value }: { label: string; value: string }) { return <div className="detail-row"><span>{label}</span><b>{value}</b></div>; }

function WaitlistPanel({ entries }: { entries: WaitlistEntry[] }) {
  return <section className="admin-panel full-panel waitlist-panel"><PanelHeading eyebrow="Early access" title="Waitlist signups" action={<button className="panel-link" onClick={() => downloadCsv("gabvia-waitlist.csv", ["Name", "Email", "Country", "Language", "Use case", "Joined"], entries.map((entry) => [entry.name, entry.email, entry.country, entry.language, entry.useCase, formatDate(entry.createdAt)]))}><Icon name="download" size={13} /> Export</button>} />{entries.length === 0 ? <EmptyState text="No waitlist signups yet." /> : <div className="waitlist-table"><div className="waitlist-table-head"><span>Person</span><span>Location</span><span>Use case</span><span>Joined</span><span>Status</span></div>{entries.slice(0, 12).map((entry) => <div className="waitlist-table-row" key={entry.id}><div className="table-user"><span className="table-avatar waitlist-avatar">{entry.name.slice(0, 1).toUpperCase()}</span><span><strong>{entry.name}</strong><small>{entry.email}</small></span></div><span>{entry.country} · {entry.language}</span><span>{entry.useCase}</span><span>{formatDate(entry.createdAt)}</span><b>{entry.status}</b></div>)}</div>}</section>;
}

function EmptyState({ text }: { text: string }) { return <div className="empty-state">{text}</div>; }
