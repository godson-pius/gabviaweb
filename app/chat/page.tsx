"use client";

import { FormattedSummary } from "@/components/chat/FormattedSummary";
import { QuickTranslatorModal } from "@/components/chat/QuickTranslatorModal";
import { WebVoicePlayer } from "@/components/chat/WebVoicePlayer";
import { useAuth } from "@/context/AuthContext";
import { useWebChat } from "@/hooks/useWebChat";
import { LANGUAGES } from "@/lib/constants";
import { ALL_MILESTONES, MILESTONE_LABELS, MILESTONE_POINTS } from "@/lib/rewards";
import { summarizeMessages } from "@/lib/translation";
import { Message, Profile } from "@/types/chat";
import {
  AlertTriangle,
  Award,
  Bell,
  BellOff,
  Calendar,
  CalendarPlus,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronLeft,
  Circle,
  Coins,
  Copy,
  Gift,
  Globe,
  KeyRound,
  Languages,
  Loader2,
  Lock,
  LogOut,
  MessageSquare,
  MoreVertical,
  Pencil,
  Pin,
  Plus,
  Reply,
  Search,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  UserMinus,
  UserPlus,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { NotificationToast } from "@/components/chat/NotificationToast";
import { NotificationPermissionBanner } from "@/components/chat/NotificationPermissionBanner";
import {
  isSoundEnabled,
  setSoundEnabled,
  areNotificationsEnabled,
  setNotificationsEnabled,
  getNotificationPermission,
  requestNotificationPermission,
  playMessageSound,
  showWebNotification,
} from "@/lib/webNotifications";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function ChatPage() {
  const router = useRouter();
  const {
    user,
    profile,
    loading: authLoading,
    needsKeyRecovery,
    hasBackup,
    signOut,
    setupBackup,
    recoverKeys,
    updateLanguage,
  } = useAuth();

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    messages,
    loadingConversations,
    loadingMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    startDirectChat,
    createGroup,
    inviteMembers,
    removeMember,
    deleteGroup,
    scheduleEvent,
    updateEvent,
    deleteEvent,
    clearPinnedEvent,
    invitations,
    acceptInvite,
    declineInvite,
    searchUsers,
    replyTo,
    setReplyTo,
    activeParticipantProfiles,
    incomingToast,
    clearIncomingToast,
  } = useWebChat();

  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");

  // Message Editing & Deletion State
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatTab, setNewChatTab] = useState<"direct" | "group">("direct");
  const [groupName, setGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<Profile[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupError, setGroupError] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<Profile[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Settings & Security Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupPin, setBackupPin] = useState("");
  const [backupError, setBackupError] = useState("");
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Notification Settings State
  const [soundActive, setSoundActive] = useState(true);
  const [notifActive, setNotifActive] = useState(true);
  const [browserPermission, setBrowserPermission] = useState<string>("default");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSoundActive(isSoundEnabled());
      setNotifActive(areNotificationsEnabled());
      setBrowserPermission(getNotificationPermission());
    }
  }, [isSettingsOpen]);

  // Summarize Modal State
  const [isSummarizeOpen, setIsSummarizeOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [summaryCopied, setSummaryCopied] = useState(false);

  // Group Details & Member Management Modal State
  const [isGroupDetailsOpen, setIsGroupDetailsOpen] = useState(false);
  const [isAddingGroupMember, setIsAddingGroupMember] = useState(false);
  const [groupMemberSearchTerm, setGroupMemberSearchTerm] = useState("");
  const [groupMemberSearchResults, setGroupMemberSearchResults] = useState<Profile[]>([]);
  const [isSearchingGroupMembers, setIsSearchingGroupMembers] = useState(false);
  const [groupActionLoading, setGroupActionLoading] = useState(false);
  const [groupActionMessage, setGroupActionMessage] = useState("");
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);

  // Schedule & Edit Event Modal State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [isSchedulingEvent, setIsSchedulingEvent] = useState(false);
  const [eventError, setEventError] = useState("");

  const [editingEvent, setEditingEvent] = useState<{
    id: string;
    title: string;
    description: string;
    date: string;
  } | null>(null);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);
  const [editEventError, setEditEventError] = useState("");
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  // Milestone Celebration & Modal State
  const [milestoneToast, setMilestoneToast] = useState<{ milestone: string; points: number } | null>(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);

  // Mobile View state (toggle between sidebar and active chat)
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMessageActionId, setActiveMessageActionId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Quick Translator Modal State
  const [isQuickTranslatorOpen, setIsQuickTranslatorOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/chat");
    }
  }, [user, authLoading, router]);

  // Handle URL insert parameter (e.g., from /translator)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const insert = params.get("insert");
      if (insert) {
        setMessageText(insert);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle user search input change
  const handleUserSearchChange = (term: string) => {
    setUserSearchTerm(term);
    if (!term.trim() || term.trim().length < 2) {
      setUserSearchResults([]);
      setIsSearchingUsers(false);
    }
  };

  const searchUsersRef = useRef(searchUsers);
  useEffect(() => {
    searchUsersRef.current = searchUsers;
  }, [searchUsers]);

  // Handle user search debounce
  useEffect(() => {
    const term = userSearchTerm.trim();
    if (!term || term.length < 2) {
      setUserSearchResults([]);
      setIsSearchingUsers(false);
      return;
    }

    let isMounted = true;
    setIsSearchingUsers(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchUsersRef.current(term);
        if (isMounted) {
          setUserSearchResults(results);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        if (isMounted) {
          setIsSearchingUsers(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [userSearchTerm]);


  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const name = c.name || c.other_user?.full_name || c.other_user?.username || "";
      const last = c.last_message || "";
      return name.toLowerCase().includes(q) || last.toLowerCase().includes(q);
    });
  }, [conversations, searchQuery]);

  // Target profile of active chat
  const otherParticipant = useMemo(() => {
    if (!activeConversation || !user) return null;
    if (activeConversation.type === "group") return null;
    const otherId = activeConversation.participants.find((p) => p !== user.uid);
    if (!otherId) return null;
    return activeParticipantProfiles[otherId] || activeConversation.other_user || null;
  }, [activeConversation, user, activeParticipantProfiles]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || isSending) return;

    setSendError("");
    setIsSending(true);

    // If currently editing an existing message
    if (editingMessage) {
      try {
        await editMessage(editingMessage.id, messageText);
        setEditingMessage(null);
        setMessageText("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      } catch (err: unknown) {
        const errObj = err as { message?: string };
        setSendError(errObj.message || "Failed to edit message.");
      } finally {
        setIsSending(false);
      }
      return;
    }

    try {
      await sendMessage(messageText);
      setMessageText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      if (errObj.message === "INSUFFICIENT_GAB_POINTS") {
        setSendError("Insufficient GAB Points. You need at least 1 GAB Point to send a cross-language message.");
      } else {
        setSendError(errObj.message || "Failed to send message.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleStartEditMessage = (msg: Message) => {
    setEditingMessage(msg);
    setMessageText(msg.content || "");
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
    }
  };

  const handleCancelEditMessage = () => {
    setEditingMessage(null);
    setMessageText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleCopyMessage = (msg: Message) => {
    const textToCopy = msg.translated_content || msg.content || "";
    if (textToCopy && typeof navigator !== "undefined") {
      navigator.clipboard.writeText(textToCopy);
      setCopiedMessageId(msg.id);
      setTimeout(() => setCopiedMessageId(null), 2000);
      setActiveMessageActionId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Only send on Enter without Shift on desktop keyboards (>= 768px)
    // On mobile keyboards, Enter inserts a newline for a better mobile typing experience
    if (e.key === "Enter" && !e.shiftKey) {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || !editingEvent) return;
    if (!editingEvent.title.trim() || !editingEvent.date) {
      setEditEventError("Title and date are required.");
      return;
    }

    setEditEventError("");
    setIsUpdatingEvent(true);
    try {
      await updateEvent(activeConversationId, editingEvent.id, {
        title: editingEvent.title.trim(),
        description: editingEvent.description.trim(),
        date: new Date(editingEvent.date).toISOString(),
      });
      setEditingEvent(null);
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setEditEventError(errObj.message || "Failed to update event.");
    } finally {
      setIsUpdatingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!activeConversationId) return;
    if (!confirm("Are you sure you want to cancel and delete this event?")) return;
    setIsDeletingEvent(true);
    try {
      await deleteEvent(activeConversationId, eventId);
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      alert(errObj.message || "Failed to delete event.");
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const handleStartChatWithUser = async (targetId: string) => {
    try {
      await startDirectChat(targetId);
      closeNewChatModal();
      setMobileShowChat(true);
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      alert(errObj.message || "Could not start chat");
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setGroupError("Please enter a group name.");
      return;
    }
    setGroupError("");
    setIsCreatingGroup(true);
    try {
      const memberIds = selectedGroupMembers.map((m) => m.id);
      await createGroup(groupName, memberIds);
      closeNewChatModal();
      setMobileShowChat(true);
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setGroupError(errObj.message || "Failed to create group.");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const toggleSelectGroupMember = (member: Profile) => {
    setSelectedGroupMembers((prev) => {
      const exists = prev.some((m) => m.id === member.id);
      if (exists) {
        return prev.filter((m) => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const closeNewChatModal = () => {
    setIsNewChatModalOpen(false);
    setUserSearchTerm("");
    setUserSearchResults([]);
    setGroupName("");
    setSelectedGroupMembers([]);
    setGroupError("");
    setNewChatTab("direct");
  };

  // Summarize messages
  const handleSummarize = async () => {
    if (!messages || messages.length === 0) {
      alert("No messages to summarize yet.");
      return;
    }
    setIsSummarizeOpen(true);
    setIsSummarizing(true);
    setSummaryText("");
    setSummaryCopied(false);

    try {
      const messagesToSummarize = messages
        .filter((m) => m.content && m.content.trim())
        .slice(-50)
        .map((m) => ({
          sender: m.sender_name || (m.sender_id === user?.uid ? "You" : "Participant"),
          content: m.translated_content || m.content || "",
        }));

      if (messagesToSummarize.length === 0) {
        setSummaryText("No readable text messages to summarize yet.");
        return;
      }

      const res = await summarizeMessages(messagesToSummarize);
      setSummaryText(res || "Could not generate summary at this time. Please try again later.");
    } catch (err: any) {
      setSummaryText("Failed to generate summary: " + (err?.message || "Unknown error"));
    } finally {
      setIsSummarizing(false);
    }
  };

  // Schedule Event
  const handleScheduleEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId) return;
    if (!eventTitle.trim()) {
      setEventError("Please enter an event title.");
      return;
    }
    if (!eventDate) {
      setEventError("Please choose a date and time for the event.");
      return;
    }

    setEventError("");
    setIsSchedulingEvent(true);
    try {
      await scheduleEvent(activeConversationId, {
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        date: eventDate,
      });
      setIsEventModalOpen(false);
      setEventTitle("");
      setEventDate("");
      setEventDescription("");
    } catch (err: any) {
      setEventError(err?.message || "Failed to schedule event.");
    } finally {
      setIsSchedulingEvent(false);
    }
  };

  // Group Member Management
  const handleInviteMemberToGroup = async (targetId: string) => {
    if (!activeConversationId) return;
    setGroupActionLoading(true);
    try {
      await inviteMembers(activeConversationId, [targetId]);
      setGroupActionMessage("Invitation sent successfully!");
      setTimeout(() => setGroupActionMessage(""), 3000);
      setGroupMemberSearchResults((prev) => prev.filter((p) => p.id !== targetId));
    } catch (err: any) {
      alert(err?.message || "Failed to invite member.");
    } finally {
      setGroupActionLoading(false);
    }
  };

  const handleRemoveMemberFromGroup = async (memberId: string) => {
    if (!activeConversationId) return;
    if (!confirm("Are you sure you want to remove this member from the group?")) return;
    setGroupActionLoading(true);
    try {
      await removeMember(activeConversationId, memberId);
      setGroupActionMessage("Member removed from group.");
      setTimeout(() => setGroupActionMessage(""), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to remove member.");
    } finally {
      setGroupActionLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!activeConversationId) return;
    setIsDeletingGroup(true);
    try {
      await deleteGroup(activeConversationId);
      setIsGroupDetailsOpen(false);
      setShowDeleteGroupConfirm(false);
      setMobileShowChat(false);
    } catch (err: any) {
      alert(err?.message || "Failed to delete group.");
    } finally {
      setIsDeletingGroup(false);
    }
  };

  // Search members to add to group
  useEffect(() => {
    const term = groupMemberSearchTerm.trim();
    if (!term || term.length < 2) {
      setGroupMemberSearchResults([]);
      setIsSearchingGroupMembers(false);
      return;
    }

    let isMounted = true;
    setIsSearchingGroupMembers(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchUsersRef.current(term);
        if (isMounted) {
          const existingIds = new Set([
            ...(activeConversation?.participants || []),
            ...(activeConversation?.pending_participants || []),
          ]);
          setGroupMemberSearchResults(results.filter((p) => !existingIds.has(p.id)));
        }
      } catch (err) {
        console.error("Group member search failed:", err);
      } finally {
        if (isMounted) {
          setIsSearchingGroupMembers(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [groupMemberSearchTerm, activeConversation]);

  // Milestone Celebration listener
  useEffect(() => {
    const handleMilestone = (e: any) => {
      if (e.detail) {
        setMilestoneToast(e.detail);
        setTimeout(() => setMilestoneToast(null), 5000);
      }
    };
    window.addEventListener("milestoneAwarded", handleMilestone);
    return () => window.removeEventListener("milestoneAwarded", handleMilestone);
  }, []);

  const claimedMilestonesCount = useMemo(() => {
    const claims = profile?.bonus_claims || {};
    return ALL_MILESTONES.filter((k) => claims[k]).length;
  }, [profile]);

  const claimedMilestonesPoints = useMemo(() => {
    const claims = profile?.bonus_claims || {};
    return ALL_MILESTONES.reduce((acc, k) => (claims[k] ? acc + MILESTONE_POINTS[k] : acc), 0);
  }, [profile]);

  const handleBackupOrRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackupError("");
    setBackupSuccess(false);

    if (backupPin.length < 4 || backupPin.length > 8) {
      setBackupError("PIN must be 4 to 8 characters.");
      return;
    }

    setIsBackingUp(true);
    try {
      if (needsKeyRecovery) {
        const ok = await recoverKeys(backupPin);
        if (ok) {
          setBackupSuccess(true);
          setTimeout(() => setIsBackupModalOpen(false), 1200);
        } else {
          setBackupError("Incorrect PIN. Please try again.");
        }
      } else {
        await setupBackup(backupPin);
        setBackupSuccess(true);
        setTimeout(() => setIsBackupModalOpen(false), 1200);
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setBackupError(errObj.message || "Failed to process backup request.");
    } finally {
      setIsBackingUp(false);
    }
  };


  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b111e] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-sm font-medium tracking-wide">Initializing secure session...</span>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#0b111e] text-slate-100 flex flex-col overscroll-none">
      {/* Recovery Banner if needed */}
      {needsKeyRecovery && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-200 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="leading-snug">
              New browser detected. Enter your Backup PIN to restore your End-to-End Encryption keys and read past messages.
            </span>
          </div>
          <button
            onClick={() => {
              setBackupError("");
              setBackupPin("");
              setIsBackupModalOpen(true);
            }}
            className="self-end sm:self-auto px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shrink-0 cursor-pointer"
          >
            Recover Keys
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside
          className={`w-full md:w-80 lg:w-96 border-r border-slate-800/80 bg-slate-900/60 flex flex-col backdrop-blur-xl shrink-0 transition-transform ${mobileShowChat ? "hidden md:flex" : "flex"
            }`}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/40 flex flex-col gap-3">
            {/* Top Row: Brand & Primary Controls */}
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 shadow-sm flex items-center justify-center">
                  <Image src="/logo.png" alt="Gabvia" width={32} height={32} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors leading-none">
                    Gabvia
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                    Messages
                  </span>
                </div>
              </Link>

              {/* Action Buttons Group */}
              <div className="flex items-center gap-1.5">
                {/* Dedicated Translator Tool */}
                <Link
                  href="/translator"
                  className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-700/40 transition-colors"
                  title="Open Dedicated Translator"
                >
                  <Languages className="w-4 h-4" />
                </Link>

                {/* Settings / Profile Button */}
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/40 transition-colors cursor-pointer"
                  title="Settings & Profile"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Start New Chat Button */}
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="p-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer font-bold"
                  title="Start New Chat"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Sub-Row: Points & Milestone Badges */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/50">
              {/* Gab Points Badge */}
              <div
                title="Your available Gab Points for translations"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shadow-inner"
              >
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>{profile?.gab_points ?? 500} pts</span>
              </div>

              {/* 1,000 Plan Milestone Badge */}
              <button
                onClick={() => setIsMilestoneModalOpen(true)}
                title="Early Adopter 1,000 Points Plan"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:border-amber-500/60 hover:bg-amber-500/20 transition-all cursor-pointer shadow-sm"
              >
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>1,000 Plan</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-800/40">
            <div className="relative rounded-xl bg-slate-950/60 border border-slate-800/80 focus-within:border-emerald-500/50 transition-all">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-transparent pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Browser Notification Permission Banner */}
          <NotificationPermissionBanner />

          {/* Group Invitations Banner */}
          {invitations.length > 0 && (
            <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Group Invitations ({invitations.length})
                </span>
              </div>
              <div className="space-y-2">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between gap-2 shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {inv.name || "Group Invitation"}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        You were invited to join
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={async () => {
                          try {
                            await acceptInvite(inv.id);
                            setMobileShowChat(true);
                          } catch (e) {
                            alert("Failed to accept invite");
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await declineInvite(inv.id);
                          } catch (e) {
                            alert("Failed to decline invite");
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/30">
            {loadingConversations ? (
              <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                <span>Syncing conversations...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-center text-slate-500 mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-300">No conversations yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                  Start chatting with friends in their native language with automatic translation.
                </p>
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                >
                  Find someone to chat
                </button>
              </div>
            ) : (
              filteredConversations.map((convo) => {
                const isActive = convo.id === activeConversationId;
                const unread = (user && convo.unread_count?.[user.uid]) || 0;
                const displayName = convo.type === "group"
                  ? convo.name || "Group Chat"
                  : convo.other_user?.full_name || convo.other_user?.username || "User";
                const userLang = convo.other_user?.native_language;

                return (
                  <button
                    key={convo.id}
                    onClick={() => {
                      setActiveConversationId(convo.id);
                      setMobileShowChat(true);
                      setTimeout(() => textareaRef.current?.focus(), 150);
                    }}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${isActive ? "bg-emerald-500/10 border-l-2 border-emerald-400" : "hover:bg-slate-800/40"
                      }`}
                  >
                    {/* Avatar */}
                    <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 flex items-center justify-center text-slate-300 font-bold text-sm shrink-0 overflow-hidden shadow">
                      {displayName.charAt(0).toUpperCase()}
                      {convo.type !== "group" && (
                        <div
                          title="Protected with End-to-End Encryption"
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-950 border border-emerald-500/40 flex items-center justify-center text-[9px] text-emerald-400"
                        >
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-sm font-semibold truncate ${isActive ? "text-emerald-400" : "text-white"}`}>
                            {displayName}
                          </span>
                          {userLang && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50 shrink-0">
                              {userLang}
                            </span>
                          )}
                        </div>
                        {convo.last_message_at && (
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {new Date(convo.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${unread > 0 ? "font-semibold text-slate-200" : "text-slate-400"}`}>
                          {convo.last_message ? (
                            convo.last_message.startsWith("{") ? (
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                <Lock className="w-3 h-3 text-emerald-400/80" /> Encrypted message
                              </span>
                            ) : (
                              convo.last_message
                            )
                          ) : (
                            <span className="italic text-slate-500">No messages yet</span>
                          )}
                        </p>
                        {unread > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold shadow-sm shadow-emerald-500/40">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* User profile footer */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-emerald-400 shrink-0">
                {profile?.full_name?.charAt(0).toUpperCase() || profile?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {profile?.full_name || profile?.username || "You"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">@{profile?.username || "username"}</p>
              </div>
            </div>

            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
              title="End-to-End Encryption Security Verified"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* CHAT AREA */}
        <section className={`flex-1 flex flex-col bg-[#0b111e] overflow-hidden ${mobileShowChat ? "flex" : "hidden md:flex"}`}>
          {activeConversation ? (
            <>
              {/* Chat Top Bar */}
              <div className="h-16 px-3 sm:px-6 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md flex items-center justify-between shrink-0 gap-2 relative">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => {
                      setMobileShowChat(false);
                      setMobileMenuOpen(false);
                    }}
                    className="md:hidden w-10 h-10 -ml-1 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all shrink-0 cursor-pointer"
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 flex items-center justify-center text-slate-300 font-bold text-sm shrink-0 shadow">
                    {activeConversation.type === "group" ? (
                      <Users className="w-5 h-5 text-emerald-400" />
                    ) : (
                      (otherParticipant?.full_name || otherParticipant?.username || "U").charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate max-w-[130px] xs:max-w-[180px] sm:max-w-[260px] md:max-w-xs">
                        {activeConversation.type === "group"
                          ? activeConversation.name || "Group Chat"
                          : otherParticipant?.full_name || otherParticipant?.username || "Direct Chat"}
                      </h3>
                      {activeConversation.type === "group" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold shrink-0">
                          <Users className="w-2.5 h-2.5" /> Group
                        </span>
                      ) : (
                        <button
                          onClick={() => setIsSecurityModalOpen(true)}
                          className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold hover:bg-emerald-500/20 transition-colors shrink-0 cursor-pointer"
                        >
                          <Lock className="w-2.5 h-2.5" /> E2EE
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                      {activeConversation.type === "group" ? (
                        <span>{activeConversation.participants.length} members · Multilingual</span>
                      ) : (
                        <>
                          {otherParticipant?.username && <span className="truncate">@{otherParticipant.username}</span>}
                          {otherParticipant?.native_language && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-emerald-400/90 shrink-0">
                                <Globe className="w-3 h-3" /> Speaks {otherParticipant.native_language}
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop Action Buttons */}
                <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Quick Translator Tool */}
                  <button
                    onClick={() => setIsQuickTranslatorOpen(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="Quick Translator Tool"
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span>Translator</span>
                  </button>

                  {/* Summarize Conversation */}
                  <button
                    onClick={handleSummarize}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="Summarize conversation with AI"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Summarize</span>
                  </button>

                  {/* Group Specific Buttons */}
                  {activeConversation.type === "group" && (
                    <>
                      <button
                        onClick={() => setIsEventModalOpen(true)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        title="Schedule Group Event"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>Event</span>
                      </button>

                      <button
                        onClick={() => setIsGroupDetailsOpen(true)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        title="Group Details & Members"
                      >
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Members ({activeConversation.participants.length})</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setIsSecurityModalOpen(true)}
                    className="p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Security Details"
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Action Controls */}
                <div className="flex md:hidden items-center gap-1 shrink-0 relative">
                  <button
                    onClick={() => setIsQuickTranslatorOpen(true)}
                    className="w-9 h-9 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    title="Quick Translator"
                  >
                    <Languages className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    title="More actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Mobile Dropdown Menu */}
                  {mobileMenuOpen && (
                    <div
                      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-16 right-3 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 flex flex-col gap-1 animate-scaleUp z-50"
                      >
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleSummarize();
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-slate-800/80 rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>AI Summarize</span>
                        </button>

                        {activeConversation.type === "group" && (
                          <>
                            <button
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setIsEventModalOpen(true);
                              }}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-slate-800/80 rounded-xl transition-colors text-left cursor-pointer"
                            >
                              <CalendarPlus className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>Schedule Event</span>
                            </button>

                            <button
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setIsGroupDetailsOpen(true);
                              }}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors text-left cursor-pointer"
                            >
                              <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>Members ({activeConversation.participants.length})</span>
                            </button>
                          </>
                        )}

                        <div className="my-1 border-t border-slate-800" />

                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setIsSecurityModalOpen(true);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800/80 rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>E2EE Security Info</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pinned Event Banner (if any) */}
              {activeConversation.pinned_event && (
                <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-slate-900 border border-amber-500/30 flex items-center justify-between gap-3 shadow-md shrink-0 animate-fadeIn">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                      <Pin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {activeConversation.pinned_event.title}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold shrink-0">
                          Pinned Event
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-300/90 font-medium truncate">
                        📅 {new Date(activeConversation.pinned_event.date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                        {activeConversation.pinned_event.description && ` · ${activeConversation.pinned_event.description}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {user && (activeConversation.pinned_event.created_by === user.uid || activeConversation.admin_id === user.uid) && (
                      <>
                        <button
                          onClick={() => {
                            if (!activeConversation.pinned_event) return;
                            setEditingEvent({
                              id: activeConversation.pinned_event.id,
                              title: activeConversation.pinned_event.title,
                              description: activeConversation.pinned_event.description || "",
                              date: activeConversation.pinned_event.date
                                ? new Date(activeConversation.pinned_event.date).toISOString().slice(0, 16)
                                : "",
                            });
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                          title="Edit Event"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={isDeletingEvent}
                          onClick={() => {
                            if (!activeConversation.pinned_event) return;
                            handleDeleteEvent(activeConversation.pinned_event.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete / Cancel Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {user && activeConversation.admin_id === user.uid && (
                      <button
                        onClick={() => clearPinnedEvent(activeConversation.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Unpin Event"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Security Announcement Card */}
                <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
                  <div className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                    {activeConversation.type === "group" ? (
                      <>
                        <Globe className="w-4 h-4" /> Multilingual Group Chat
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" /> End-to-End Encrypted
                      </>
                    )}
                  </div>
                  <p>
                    {activeConversation.type === "group"
                      ? "Messages in this group are translated into each member's native language in real-time."
                      : `Messages between you and ${otherParticipant?.full_name || otherParticipant?.username || "your contact"} are encrypted with your device keys. No third party, not even Gabvia, can read them.`}
                  </p>
                </div>

                {loadingMessages ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    <p>No messages yet. Send a friendly greeting to start your conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.uid;
                    const timeStr = msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "";

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"} group animate-fadeIn`}
                      >
                        {/* Reply reference preview */}
                        {msg.reply_to && (
                          <div
                            className={`text-[11px] mb-1 px-3 py-1 rounded-lg border max-w-sm truncate ${isMe
                                ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-300"
                                : "bg-slate-800/60 border-slate-700/60 text-slate-300"
                              }`}
                          >
                            <span className="font-semibold">{msg.reply_to.sender_name}: </span>
                            <span>{msg.reply_to.content}</span>
                          </div>
                        )}

                        <div className="flex items-end gap-1.5 max-w-[85%] sm:max-w-[70%]">
                          {/* Message Bubble */}
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm shadow-md transition-all ${isMe
                                ? "bg-emerald-600 text-white rounded-br-xs"
                                : "bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-bl-xs"
                              }`}
                          >
                            {!isMe && activeConversation.type === "group" && (
                              <p className="text-[10px] font-bold text-emerald-400 mb-1">
                                {msg.sender_name}
                              </p>
                            )}

                            {msg.type === "event" ? (
                              <div className="py-1 min-w-[220px]">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs truncate">
                                    <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span className="truncate">
                                      {msg.event_data?.title || msg.content?.replace(/^📅\s*(New|Updated)\s*Event:\s*/, "") || "Group Event"}
                                    </span>
                                  </div>
                                  {msg.event_data?.status === "cancelled" ? (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold shrink-0 border border-rose-500/30">
                                      Cancelled
                                    </span>
                                  ) : (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold shrink-0">
                                      Active
                                    </span>
                                  )}
                                </div>
                                {msg.event_data?.date && (
                                  <p className="text-[11px] text-emerald-300 font-medium mb-1 flex items-center gap-1">
                                    <span>⏰</span>
                                    <span>{new Date(msg.event_data.date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                                  </p>
                                )}
                                {msg.event_data?.description && (
                                  <p className="text-xs text-slate-200 mt-1 bg-black/20 p-2 rounded-lg leading-relaxed">
                                    {msg.event_data.description}
                                  </p>
                                )}

                                {/* Event Creator or Admin Actions */}
                                {msg.event_id && msg.event_data?.status !== "cancelled" && user && (msg.event_data?.created_by === user.uid || activeConversation.admin_id === user.uid) && (
                                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5 justify-end">
                                    <button
                                      onClick={() => {
                                        setEditingEvent({
                                          id: msg.event_id!,
                                          title: msg.event_data?.title || "",
                                          description: msg.event_data?.description || "",
                                          date: msg.event_data?.date
                                            ? new Date(msg.event_data.date).toISOString().slice(0, 16)
                                            : "",
                                        });
                                      }}
                                      className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                      title="Edit Event"
                                    >
                                      <Pencil className="w-3 h-3" /> Edit
                                    </button>
                                    <button
                                      disabled={isDeletingEvent}
                                      onClick={() => handleDeleteEvent(msg.event_id!)}
                                      className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                      title="Cancel Event"
                                    >
                                      <Trash2 className="w-3 h-3" /> Cancel
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : msg.type === "voice" ? (
                              <div className="py-0.5">
                                {msg.audio_url ? (
                                  <WebVoicePlayer
                                    uri={msg.audio_url}
                                    isMine={isMe}
                                    duration={msg.duration}
                                    translatedUri={msg.translated_audio_url}
                                  />
                                ) : (
                                  <div className="flex items-center gap-2 text-xs py-1">
                                    <span>🎙️ Voice Note</span>
                                  </div>
                                )}
                                {msg.content && (
                                  <p className="mt-1 text-xs opacity-90 italic">
                                    "{msg.content}"
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap break-words leading-relaxed select-text">
                                {msg.content}
                              </p>
                            )}

                            {/* Translated content preview if present */}
                            {msg.translated_content && msg.translated_content !== msg.content && (
                              <div className="mt-2 pt-2 border-t border-white/20 text-xs text-emerald-100 italic">
                                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-200 uppercase tracking-wider mb-0.5">
                                  <Sparkles className="w-2.5 h-2.5" /> Translated
                                </div>
                                {msg.translated_content}
                              </div>
                            )}

                            {/* Translating indicator */}
                            {msg.is_translation_loading && !msg.translated_content && (
                              <div className="mt-2 pt-2 border-t border-white/20 text-xs text-emerald-100/70 italic flex items-center gap-1.5">
                                <Loader2 className="w-3 h-3 animate-spin text-emerald-300" />
                                <span className="text-[10px]">Translating...</span>
                              </div>
                            )}

                            {/* Bubble footer with time & status */}
                            <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-white/70">
                              {msg.is_edited && (
                                <span className="italic opacity-80 mr-0.5 text-[9px]">(edited)</span>
                              )}
                              <span>{timeStr}</span>
                              {isMe && (
                                <span>
                                  {msg.status === "sending" ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : msg.status === "delivered" || msg.status === "read" ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Message actions: hover on desktop, popup menu on mobile */}
                          <div className="relative self-center shrink-0">
                            {/* Desktop hover actions */}
                            <div className="hidden md:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setReplyTo(msg)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Reply"
                              >
                                <Reply className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleCopyMessage(msg)}
                                className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Copy Text"
                              >
                                {copiedMessageId === msg.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              {isMe && msg.type === "text" && (
                                <button
                                  onClick={() => handleStartEditMessage(msg)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Edit Message"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => setDeletingMessage(msg)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Delete Message"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Mobile action trigger (three dots) */}
                            <div className="md:hidden">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMessageActionId(activeMessageActionId === msg.id ? null : msg.id);
                                }}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  activeMessageActionId === msg.id
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-500 hover:text-slate-300"
                                }`}
                                title="Message options"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {/* Mobile Popover Menu */}
                              {activeMessageActionId === msg.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className={`absolute z-30 bottom-full mb-1 ${
                                    isMe ? "right-0" : "left-0"
                                  } min-w-[130px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 animate-scaleUp`}
                                >
                                  <button
                                    onClick={() => {
                                      setReplyTo(msg);
                                      setActiveMessageActionId(null);
                                    }}
                                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
                                  >
                                    <Reply className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>Reply</span>
                                  </button>
                                  <button
                                    onClick={() => handleCopyMessage(msg)}
                                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                    <span>{copiedMessageId === msg.id ? "Copied!" : "Copy"}</span>
                                  </button>
                                  {isMe && msg.type === "text" && (
                                    <button
                                      onClick={() => {
                                        handleStartEditMessage(msg);
                                        setActiveMessageActionId(null);
                                      }}
                                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
                                    >
                                      <Pencil className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span>Edit</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setDeletingMessage(msg);
                                      setActiveMessageActionId(null);
                                    }}
                                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Edit Message Banner */}
              {editingMessage && (
                <div className="px-3 sm:px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs animate-fadeIn shrink-0">
                  <div className="flex items-center gap-2 text-slate-300 truncate">
                    <Pencil className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-amber-300 font-semibold shrink-0">Editing Message:</span>
                    <span className="text-slate-400 truncate max-w-xs sm:max-w-sm">{editingMessage.content}</span>
                  </div>
                  <button onClick={handleCancelEditMessage} className="text-slate-500 hover:text-white p-1 cursor-pointer shrink-0" title="Cancel Edit">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Reply Preview Banner */}
              {replyTo && (
                <div className="px-3 sm:px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center gap-2 text-slate-300 truncate">
                    <Reply className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Replying to <strong>{replyTo.sender_name}</strong>: </span>
                    <span className="text-slate-400 truncate max-w-xs sm:max-w-sm">{replyTo.content}</span>
                  </div>
                  <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-white p-1 cursor-pointer shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Input Area */}
              <div className="p-2.5 sm:p-4 border-t border-slate-800/80 bg-slate-900/70 backdrop-blur-xl shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                {sendError && (
                  <div className="mb-2 text-xs text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{sendError}</span>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-end gap-1.5 sm:gap-2">
                  <div className="flex-1 relative rounded-2xl bg-slate-950/80 border border-slate-800 focus-within:border-emerald-500/60 transition-all">
                    <textarea
                      ref={textareaRef}
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                      }}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      placeholder={`Write in ${profile?.native_language || "your language"}...`}
                      className="w-full bg-transparent px-3.5 py-2.5 sm:px-4 sm:py-3 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-32 min-h-[44px]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsQuickTranslatorOpen(true)}
                    className="w-11 h-11 rounded-2xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                    title="Translate text or voice"
                  >
                    <Languages className="w-5 h-5" />
                  </button>

                  <button
                    type="submit"
                    disabled={!messageText.trim() || isSending}
                    className="w-11 h-11 rounded-2xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    End-to-End Encrypted
                  </span>
                  <span className="hidden sm:inline">Shift+Enter for new line</span>
                  <span className="sm:hidden text-[10px] text-slate-500">Private Session</span>
                </div>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Your Conversations</h2>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Select a conversation from the sidebar or click &ldquo;+&rdquo; to find and start talking to someone in any language.
              </p>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="mt-6 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Start a New Chat
              </button>
            </div>
          )}
        </section>
      </div>

      {/* NEW CHAT / GROUP MODAL */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl animate-scaleUp overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/70 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewChatTab("direct")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${newChatTab === "direct"
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                    }`}
                >
                  <User className="w-3.5 h-3.5" /> Direct Chat
                </button>
                <button
                  type="button"
                  onClick={() => setNewChatTab("group")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${newChatTab === "group"
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                    }`}
                >
                  <Users className="w-3.5 h-3.5" /> New Group
                </button>
              </div>

              <button
                onClick={closeNewChatModal}
                className="text-slate-500 hover:text-white p-2 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {newChatTab === "direct" ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="relative mb-3 shrink-0">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => handleUserSearchChange(e.target.value)}
                    placeholder="Search by @username or email..."
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                    autoFocus
                  />
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 pr-1">
                  {isSearchingUsers ? (
                    <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Searching users...
                    </div>
                  ) : userSearchResults.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      {userSearchTerm.trim().length >= 2 ? "No users found." : "Type at least 2 characters to search."}
                    </div>
                  ) : (
                    userSearchResults.map((target) => (
                      <div
                        key={target.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-800/40 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs shrink-0">
                            {(target.full_name || target.username).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {target.full_name || target.username}
                            </p>
                            <p className="text-xs text-slate-400 truncate">@{target.username} · {target.native_language}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartChatWithUser(target.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer shrink-0 ml-2"
                        >
                          Chat
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateGroup} className="space-y-4 flex-1 overflow-y-auto pr-1">
                {groupError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{groupError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Design Team, Family, Global Project"
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                    required
                  />
                </div>

                {/* Selected Members Chips */}
                {selectedGroupMembers.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Selected Members ({selectedGroupMembers.length})
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      {selectedGroupMembers.map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                        >
                          <span>{m.full_name || `@${m.username}`}</span>
                          <button
                            type="button"
                            onClick={() => toggleSelectGroupMember(m)}
                            className="hover:text-white transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Member Search */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Invite Members
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => handleUserSearchChange(e.target.value)}
                      placeholder="Search users to add..."
                      className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                </div>

                {/* Member Search Results */}
                <div className="max-h-40 overflow-y-auto divide-y divide-slate-800/40 border border-slate-800/60 rounded-2xl bg-slate-950/40">
                  {isSearchingUsers ? (
                    <div className="p-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> Searching...
                    </div>
                  ) : userSearchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      {userSearchTerm.trim().length >= 2 ? "No users found." : "Search to find people to invite."}
                    </div>
                  ) : (
                    userSearchResults.map((target) => {
                      const isSelected = selectedGroupMembers.some((m) => m.id === target.id);
                      return (
                        <div
                          key={target.id}
                          className="p-2.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs shrink-0">
                              {(target.full_name || target.username).charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">
                                {target.full_name || target.username}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">@{target.username}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSelectGroupMember(target)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${isSelected
                                ? "bg-emerald-500 text-slate-950"
                                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                              }`}
                          >
                            {isSelected ? "Selected" : "Add"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isCreatingGroup || !groupName.trim()}
                  className="w-full py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {isCreatingGroup ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating Group...
                    </span>
                  ) : (
                    `Create Group (${selectedGroupMembers.length} invited)`
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS / PROFILE MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-4 sm:mb-6 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" /> Profile & Settings
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-500 hover:text-white p-2 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {/* Profile Info */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-base shrink-0">
                  {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">{profile?.full_name}</h4>
                  <p className="text-xs text-slate-400 truncate">@{profile?.username}</p>
                  <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
                </div>
              </div>

              {/* Native Language Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Your Native Language
                </label>
                <div className="relative rounded-2xl bg-slate-950 border border-slate-800">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  <select
                    value={profile?.native_language || "English"}
                    onChange={(e) => updateLanguage(e.target.value)}
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-white rounded-2xl appearance-none cursor-pointer focus:outline-none"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value} className="bg-slate-900 text-white">
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Incoming messages will be translated into this language.
                </p>
              </div>

              {/* E2EE Backup PIN Section */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-emerald-400" /> E2EE Backup PIN
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${hasBackup ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                    {hasBackup ? "Backed Up" : "Not Set"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  {hasBackup
                    ? "Your keys are safely backed up with a secure PIN. You can change your PIN anytime."
                    : "Set a 4-8 digit PIN to back up your keys so you never lose message history when switching devices."}
                </p>
                <button
                  onClick={() => {
                    setBackupError("");
                    setBackupPin("");
                    setIsBackupModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {hasBackup ? "Update Backup PIN" : "Setup Backup PIN"}
                </button>
              </div>

              {/* Notifications & Sound Section */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-emerald-400" /> Notifications & Sound
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      browserPermission === "granted"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : browserPermission === "denied"
                        ? "bg-rose-500/10 text-rose-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {browserPermission === "granted"
                      ? "Active"
                      : browserPermission === "denied"
                      ? "Blocked"
                      : "Not Enabled"}
                  </span>
                </div>

                {/* Sound Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    {soundActive ? (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-500" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-slate-200">Message Sound</p>
                      <p className="text-[10px] text-slate-500">Play chime when messages arrive</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const next = !soundActive;
                      setSoundActive(next);
                      setSoundEnabled(next);
                      if (next) playMessageSound();
                    }}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      soundActive ? "bg-emerald-500" : "bg-slate-800"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        soundActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Browser Notifications Toggle / Request */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    {notifActive && browserPermission === "granted" ? (
                      <Bell className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <BellOff className="w-4 h-4 text-slate-500" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-slate-200">Browser Alerts</p>
                      <p className="text-[10px] text-slate-500">
                        {browserPermission === "granted"
                          ? "Desktop & background notifications"
                          : browserPermission === "denied"
                          ? "Blocked in browser permissions"
                          : "Prompt for browser permission"}
                      </p>
                    </div>
                  </div>

                  {browserPermission === "granted" ? (
                    <button
                      onClick={() => {
                        const next = !notifActive;
                        setNotifActive(next);
                        setNotificationsEnabled(next);
                      }}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        notifActive ? "bg-emerald-500" : "bg-slate-800"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          notifActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        const res = await requestNotificationPermission();
                        setBrowserPermission(res);
                        if (res === "granted") {
                          setNotifActive(true);
                          playMessageSound();
                          showWebNotification({
                            title: "Notifications Enabled 🔔",
                            body: "You're all set to receive message notifications on web!",
                          });
                        }
                      }}
                      disabled={browserPermission === "denied"}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {browserPermission === "denied" ? "Blocked" : "Enable"}
                    </button>
                  )}
                </div>

                {/* Test Notification Button */}
                <button
                  onClick={() => {
                    playMessageSound();
                    showWebNotification({
                      title: "Gabvia Web Chat",
                      body: "Test notification: sound and alerts are working properly! 🎉",
                      tag: "test-notification",
                    });
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Notification Sound & Alert</span>
                </button>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={async () => {
                  await signOut();
                  setIsSettingsOpen(false);
                  router.replace("/login");
                }}
                className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BACKUP / RECOVER KEYS MODAL */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-sm max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                {needsKeyRecovery ? "Recover E2EE Keys" : "Set Backup PIN"}
              </h3>
              <button onClick={() => setIsBackupModalOpen(false)} className="text-slate-500 hover:text-white p-2 rounded-xl transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              {needsKeyRecovery
                ? "Enter your backup PIN to decrypt your private key and unlock your past messages."
                : "Choose a 4 to 8 digit PIN. Your key will be encrypted on your device before backup."}
            </p>

            {backupError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{backupError}</span>
              </div>
            )}

            {backupSuccess && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{needsKeyRecovery ? "Keys recovered successfully!" : "PIN backup saved successfully!"}</span>
              </div>
            )}

            <form onSubmit={handleBackupOrRecovery} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Backup PIN (4-8 digits)
                </label>
                <input
                  type="password"
                  value={backupPin}
                  onChange={(e) => setBackupPin(e.target.value)}
                  placeholder="••••"
                  maxLength={8}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-center text-lg tracking-widest text-white focus:outline-none focus:border-emerald-500/60"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isBackingUp || backupPin.length < 4}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isBackingUp ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
                  </span>
                ) : needsKeyRecovery ? (
                  "Unlock Messages"
                ) : (
                  "Save Backup PIN"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SECURITY DETAILS MODAL */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Gabvia Security Architecture
              </h3>
              <button onClick={() => setIsSecurityModalOpen(false)} className="text-slate-500 hover:text-white p-2 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 flex-1 overflow-y-auto pr-1">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Lock className="w-3.5 h-3.5" /> Military-Grade End-to-End Encryption
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Direct messages are encrypted directly on your device using TweetNaCl X25519-XSalsa20-Poly1305 before transmission. They are stored as ciphertext in Firestore and can only be decrypted by the intended recipient.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <h4 className="font-bold text-blue-400 flex items-center gap-1.5 mb-1">
                  <KeyRound className="w-3.5 h-3.5" /> Zero-Knowledge Key Storage
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Your private encryption key never touches our servers in plaintext. If you set a backup PIN, it is salted and encrypted on your device with SecretBox before sync.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <h4 className="font-bold text-purple-400 flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5" /> Hardened Web Infrastructure
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Protected with strict Content Security Policy, XSS payload sanitization, clickjacking protection (DENY frame options), and brute-force throttling against unauthorized access.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSecurityModalOpen(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* FLOATING INCOMING MESSAGE NOTIFICATION TOAST */}
      <NotificationToast
        toast={incomingToast}
        onOpenConversation={(convId) => {
          setActiveConversationId(convId);
          setMobileShowChat(true);
        }}
        onClose={clearIncomingToast}
      />

      {/* FLOATING MILESTONE CELEBRATION TOAST */}
      {milestoneToast && (
        <div className="fixed top-4 right-4 z-50 animate-bounce p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-3 max-w-[calc(100vw-2rem)]">
          <Award className="w-6 h-6 text-slate-950 shrink-0" />
          <div>
            <p className="text-xs font-black">🎉 Milestone Unlocked!</p>
            <p className="text-[11px] font-semibold text-slate-900">
              +{milestoneToast.points} GAB Points added to your account!
            </p>
          </div>
        </div>
      )}

      {/* SUMMARIZE CHAT MODAL */}
      {isSummarizeOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-xl max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl animate-scaleUp overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                AI Conversation Summary
              </h3>
              <button onClick={() => setIsSummarizeOpen(false)} className="text-slate-500 hover:text-white p-2 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSummarizing ? (
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                <p className="text-xs text-slate-400">Analyzing conversation with AI...</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 leading-relaxed flex-1 overflow-y-auto">
                  <FormattedSummary content={summaryText} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 shrink-0">
                  <button
                    onClick={() => {
                      if (!summaryText) return;
                      navigator.clipboard.writeText(summaryText);
                      setSummaryCopied(true);
                      setTimeout(() => setSummaryCopied(false), 2000);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {summaryCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Summary
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsSummarizeOpen(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GROUP DETAILS & MEMBERS MODAL */}
      {isGroupDetailsOpen && activeConversation && activeConversation.type === "group" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl animate-scaleUp max-h-[90dvh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white truncate max-w-xs">
                    {activeConversation.name || "Group Chat"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeConversation.participants.length} member{activeConversation.participants.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsGroupDetailsOpen(false);
                  setIsAddingGroupMember(false);
                  setGroupMemberSearchTerm("");
                  setShowDeleteGroupConfirm(false);
                }}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {groupActionMessage && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 shrink-0">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{groupActionMessage}</span>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mb-4 shrink-0">
              <button
                onClick={() => {
                  setIsGroupDetailsOpen(false);
                  handleSummarize();
                }}
                className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" /> Summarize Chat
              </button>
              <button
                onClick={() => {
                  setIsGroupDetailsOpen(false);
                  setIsEventModalOpen(true);
                }}
                className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4 text-emerald-400" /> Schedule Event
              </button>
            </div>

            {/* Owner Section: Add Members Toggle */}
            {user && activeConversation.admin_id === user.uid && (
              <div className="mb-4 shrink-0">
                <button
                  onClick={() => setIsAddingGroupMember(!isAddingGroupMember)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  {isAddingGroupMember ? "Hide Add Member" : "Add Members (Owner)"}
                </button>

                {isAddingGroupMember && (
                  <div className="mt-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={groupMemberSearchTerm}
                        onChange={(e) => setGroupMemberSearchTerm(e.target.value)}
                        placeholder="Search users to add to group..."
                        className="w-full rounded-xl bg-slate-900 border border-slate-700/60 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                        autoFocus
                      />
                    </div>

                    <div className="max-h-36 overflow-y-auto divide-y divide-slate-800/40">
                      {isSearchingGroupMembers ? (
                        <div className="p-2 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> Searching...
                        </div>
                      ) : groupMemberSearchResults.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-500">
                          {groupMemberSearchTerm.trim().length >= 2 ? "No users available to invite." : "Type at least 2 characters."}
                        </div>
                      ) : (
                        groupMemberSearchResults.map((target) => (
                          <div
                            key={target.id}
                            className="p-2 flex items-center justify-between hover:bg-slate-900/60 rounded-lg transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">
                                {target.full_name || target.username}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">@{target.username}</p>
                            </div>
                            <button
                              disabled={groupActionLoading}
                              onClick={() => handleInviteMemberToGroup(target.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              Invite
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Member List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 pr-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Participants
              </h4>
              {activeConversation.participants.map((pId) => {
                const isOwner = pId === activeConversation.admin_id;
                const isMe = pId === user?.uid;
                const pProfile = activeParticipantProfiles[pId] || (isMe ? profile : null);
                const displayName = pProfile?.full_name || pProfile?.username || (isMe ? "You" : "Participant");

                return (
                  <div key={pId} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200 shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                          {isOwner && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                              Owner
                            </span>
                          )}
                          {isMe && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {pProfile?.username ? `@${pProfile.username}` : ""} {pProfile?.native_language ? `· ${pProfile.native_language}` : ""}
                        </p>
                      </div>
                    </div>

                    {user && activeConversation.admin_id === user.uid && !isMe && (
                      <button
                        disabled={groupActionLoading}
                        onClick={() => handleRemoveMemberFromGroup(pId)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                        title="Remove member"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Owner Section: Admin Controls (Delete Group) */}
            {user && activeConversation.admin_id === user.uid && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    Admin Controls
                  </h4>
                </div>

                {!showDeleteGroupConfirm ? (
                  <button
                    onClick={() => setShowDeleteGroupConfirm(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    Delete Group Permanently
                  </button>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-3 animate-fadeIn">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-rose-300">Delete this group?</h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                          This will permanently delete the group for all members. All messages, translations, and pinned events will be removed. This cannot be undone.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button
                        type="button"
                        disabled={isDeletingGroup}
                        onClick={() => setShowDeleteGroupConfirm(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isDeletingGroup}
                        onClick={handleDeleteGroup}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        {isDeletingGroup ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCHEDULE EVENT MODAL */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl animate-scaleUp overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-emerald-400" />
                Schedule Group Event
              </h3>
              <button onClick={() => setIsEventModalOpen(false)} className="text-slate-500 hover:text-white p-2 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {eventError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{eventError}</span>
              </div>
            )}

            <form onSubmit={handleScheduleEvent} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Weekly Standup, Project Sync, Family Dinner"
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description / Agenda (Optional)
                </label>
                <textarea
                  rows={3}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Meeting agenda, location link, or details..."
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSchedulingEvent || !eventTitle.trim() || !eventDate}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSchedulingEvent ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Scheduling...
                  </span>
                ) : (
                  "Schedule & Pin Event"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EARLY ADOPTER 1,000 MILESTONE MODAL */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl animate-scaleUp overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    Early Adopter 1,000 Plan
                  </h3>
                  <p className="text-[11px] text-slate-400">Exclusive new user reward campaign</p>
                </div>
              </div>
              <button onClick={() => setIsMilestoneModalOpen(false)} className="text-slate-500 hover:text-white p-2 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {/* Progress Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-950 to-emerald-500/10 border border-amber-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">Campaign Progress</span>
                  <span className="text-xs font-extrabold text-amber-400">
                    {claimedMilestonesPoints} / 1,000 GAB Points
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, (claimedMilestonesPoints / 1000) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  {claimedMilestonesCount} of {ALL_MILESTONES.length} milestones claimed. GAB Points power your real-time multilingual translations.
                </p>
              </div>

              {/* Milestones Checklist */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {ALL_MILESTONES.map((key) => {
                  const info = MILESTONE_LABELS[key];
                  const isClaimed = !!profile?.bonus_claims?.[key];
                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${isClaimed
                          ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                          : "bg-slate-950/40 border-slate-800 text-slate-300"
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isClaimed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isClaimed ? "text-emerald-300" : "text-white"}`}>
                            {info.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{info.desc}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${isClaimed
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400"
                          }`}
                      >
                        +{info.points} pts
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Referral Share Box for the Invite Milestone */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Your Referral Code
                  </p>
                  <p className="text-xs font-bold text-white truncate">
                    {profile?.referral_code || profile?.username || "—"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const code = profile?.referral_code || profile?.username || "";
                    const link = `https://gabvia.app/register?ref=${code}`;
                    navigator.clipboard.writeText(link);
                    setReferralCopied(true);
                    setTimeout(() => setReferralCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {referralCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Link Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Invite Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MESSAGE CONFIRM MODAL */}
      {deletingMessage && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl animate-scaleUp space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Message</h3>
                <p className="text-xs text-slate-400">Choose how you want to delete this message</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 max-h-24 overflow-y-auto">
              <p className="italic">"{deletingMessage.content || 'Voice note / Event'}"</p>
            </div>

            <div className="space-y-2 pt-1">
              {(deletingMessage.sender_id === user?.uid || activeConversation?.admin_id === user?.uid) && (
                <button
                  disabled={isDeletingMessage}
                  onClick={async () => {
                    setIsDeletingMessage(true);
                    try {
                      await deleteMessage(deletingMessage.id, "everyone");
                      setDeletingMessage(null);
                    } catch (err: unknown) {
                      const errObj = err as { message?: string };
                      alert(errObj.message || "Failed to delete message for everyone.");
                    } finally {
                      setIsDeletingMessage(false);
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeletingMessage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete for Everyone
                </button>
              )}

              <button
                disabled={isDeletingMessage}
                onClick={async () => {
                  setIsDeletingMessage(true);
                  try {
                    await deleteMessage(deletingMessage.id, "for_me");
                    setDeletingMessage(null);
                  } catch (err: unknown) {
                    const errObj = err as { message?: string };
                    alert(errObj.message || "Failed to delete message for you.");
                  } finally {
                    setIsDeletingMessage(false);
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Delete for Me
              </button>

              <button
                disabled={isDeletingMessage}
                onClick={() => setDeletingMessage(null)}
                className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl animate-scaleUp overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-400" />
                Edit Group Event
              </h3>
              <button onClick={() => setEditingEvent(null)} className="text-slate-500 hover:text-white p-2 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editEventError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{editEventError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateEvent} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Event Title
                </label>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="e.g. Weekly Standup, Project Sync, Family Dinner"
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={editingEvent.date}
                  onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description / Agenda (Optional)
                </label>
                <textarea
                  rows={3}
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  placeholder="Meeting agenda, location link, or details..."
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 justify-end pt-1 shrink-0">
                <button
                  type="button"
                  disabled={isUpdatingEvent}
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingEvent || !editingEvent.title.trim() || !editingEvent.date}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isUpdatingEvent ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Translator Modal */}
      <QuickTranslatorModal
        isOpen={isQuickTranslatorOpen}
        onClose={() => setIsQuickTranslatorOpen(false)}
        initialText={messageText}
        defaultTargetLanguage={otherParticipant?.native_language || undefined}
        onInsertToChat={(text) => {
          setMessageText((prev) => (prev ? `${prev} ${text}` : text));
          setTimeout(() => textareaRef.current?.focus(), 150);
        }}
      />
    </div>
  );
}
