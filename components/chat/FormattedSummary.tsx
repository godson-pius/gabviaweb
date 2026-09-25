"use client";

import React, { useMemo } from "react";
import {
  Sparkles,
  FileText,
  CheckCircle2,
  ListChecks,
  ChevronRight,
  Info,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface FormattedSummaryProps {
  content: string;
}

interface SummarySection {
  title?: string;
  iconType?: "actions" | "status" | "info" | "event" | "default";
  items: Array<{
    type: "bullet" | "paragraph" | "callout";
    label?: string;
    text: string;
  }>;
}

/**
 * Parses inline markdown:
 * - **bold text**
 * - *italic text*
 * - `code`
 */
function parseInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match bold (**text**), italic (*text*), or inline code (`text`)
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold text-white tracking-wide">
          {inner}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic text-slate-300">
          {inner}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 text-[11px] font-mono border border-slate-700/50"
        >
          {inner}
        </code>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function FormattedSummary({ content }: FormattedSummaryProps) {
  const parsed = useMemo(() => {
    if (!content) return { subject: null, sections: [], rawText: "" };

    const rawLines = content.split("\n").map((l) => l.trim());
    let subject: string | null = null;
    const sections: SummarySection[] = [];
    let currentSection: SummarySection = { items: [] };

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (!line) continue;

      // 1. Skip redundant main title if it's "### Conversation Summary" or similar
      if (
        /^#+\s*(Conversation Summary|Chat Summary|Summary)\s*$/i.test(line) ||
        /^\*\*(Conversation Summary|Chat Summary)\*\*\s*$/i.test(line)
      ) {
        continue;
      }

      // 2. Detect Subject / Topic / Title (e.g. "**Subject:** Event Management Updates" or "**Topic:** ...")
      const subjectMatch = line.match(/^\*?\*?(Subject|Topic|Title):\*?\*?\s*(.+)$/i);
      if (subjectMatch) {
        subject = subjectMatch[2].replace(/^\*\*|\*\*$/g, "").trim();
        continue;
      }

      // 3. Detect Section Headers:
      // e.g. "### Summary of Actions:" or "**Summary of Actions:**" or "**Status:**"
      const isBulletOrList = /^(\*|-|\+|\d+\.)\s+/.test(line);
      const headingMatch = !isBulletOrList && (
        line.match(/^#+\s*(.+)$/) ||
        line.match(/^\*\*([^*]+)\*\*:?$/)
      );

      if (headingMatch) {
        const titleText = headingMatch[1].replace(/[:*#]/g, "").trim();

        // Check if current section has items before pushing
        if (currentSection.title || currentSection.items.length > 0) {
          sections.push(currentSection);
        }

        let iconType: SummarySection["iconType"] = "default";
        const lower = titleText.toLowerCase();
        if (lower.includes("action") || lower.includes("task") || lower.includes("update")) {
          iconType = "actions";
        } else if (lower.includes("status") || lower.includes("result") || lower.includes("outcome") || lower.includes("conclusion")) {
          iconType = "status";
        } else if (lower.includes("event") || lower.includes("schedule")) {
          iconType = "event";
        } else if (lower.includes("info") || lower.includes("note") || lower.includes("topic") || lower.includes("detail")) {
          iconType = "info";
        }

        currentSection = {
          title: titleText,
          iconType,
          items: [],
        };
        continue;
      }

      // 4. Detect Bullet Items:
      // e.g. "* **Event Cancellation:** The event previously titled..."
      // e.g. "* All requested changes have been processed successfully."
      const bulletMatch = line.match(/^(\*|-|\+)\s+(.+)$/);
      if (bulletMatch) {
        const bulletBody = bulletMatch[2].trim();

        // Check if bullet starts with a bold label like "**Label:** rest of text"
        const labelMatch = bulletBody.match(/^\*\*([^*:]+):?\*\*:?\s*(.+)$/);
        if (labelMatch) {
          currentSection.items.push({
            type: "bullet",
            label: labelMatch[1].trim(),
            text: labelMatch[2].trim(),
          });
        } else {
          currentSection.items.push({
            type: "bullet",
            text: bulletBody,
          });
        }
        continue;
      }

      // 5. Detect Numbered List:
      // e.g. "1. **Label:** text"
      const numberedMatch = line.match(/^\d+\.\s+(.+)$/);
      if (numberedMatch) {
        const body = numberedMatch[1].trim();
        const labelMatch = body.match(/^\*\*([^*:]+):?\*\*:?\s*(.+)$/);
        if (labelMatch) {
          currentSection.items.push({
            type: "bullet",
            label: labelMatch[1].trim(),
            text: labelMatch[2].trim(),
          });
        } else {
          currentSection.items.push({
            type: "bullet",
            text: body,
          });
        }
        continue;
      }

      // 6. Regular text / paragraph line
      currentSection.items.push({
        type: "paragraph",
        text: line,
      });
    }

    if (currentSection.title || currentSection.items.length > 0) {
      sections.push(currentSection);
    }

    return { subject, sections, rawText: content };
  }, [content]);

  if (!content) {
    return (
      <div className="text-center py-6 text-slate-400 text-xs">
        No summary content available.
      </div>
    );
  }

  // Fallback to formatted text if parser found no structured sections
  if (!parsed.subject && parsed.sections.length === 0) {
    return (
      <div className="text-xs text-slate-200 leading-relaxed space-y-2">
        {content.split("\n\n").map((para, i) => (
          <p key={i}>{parseInlineMarkdown(para)}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Subject Header Banner */}
      {parsed.subject && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-3.5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                Subject
              </span>
              <h4 className="text-sm font-semibold text-white truncate">
                {parsed.subject}
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      {parsed.sections.map((section, sIndex) => {
        const isStatusSection = section.iconType === "status";

        return (
          <div
            key={sIndex}
            className={`rounded-2xl transition-all ${
              isStatusSection
                ? "bg-emerald-950/30 border border-emerald-500/20 p-3.5"
                : "bg-slate-900/50 border border-slate-800/80 p-3.5"
            }`}
          >
            {/* Section Header */}
            {section.title && (
              <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-slate-800/60">
                {section.iconType === "actions" && (
                  <ListChecks className="w-4 h-4 text-amber-400" />
                )}
                {section.iconType === "status" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                {section.iconType === "event" && (
                  <Calendar className="w-4 h-4 text-sky-400" />
                )}
                {section.iconType === "info" && (
                  <Info className="w-4 h-4 text-indigo-400" />
                )}
                {section.iconType === "default" && (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
                <h5
                  className={`text-xs font-bold tracking-wide uppercase ${
                    isStatusSection ? "text-emerald-400" : "text-slate-300"
                  }`}
                >
                  {section.title}
                </h5>
              </div>
            )}

            {/* Section Items */}
            <div className="space-y-2.5">
              {section.items.map((item, iIndex) => {
                if (item.type === "bullet") {
                  return (
                    <div
                      key={iIndex}
                      className="flex items-start gap-2.5 text-xs leading-relaxed"
                    >
                      {/* Bullet Indicator */}
                      <div className="mt-1 shrink-0">
                        {isStatusSection ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                        )}
                      </div>

                      <div className="text-slate-200">
                        {item.label && (
                          <span className="font-semibold text-white mr-1.5 bg-slate-800/80 px-1.5 py-0.5 rounded text-[11px] border border-slate-700/60 inline-block align-baseline">
                            {item.label}
                          </span>
                        )}
                        <span className="text-slate-300">
                          {parseInlineMarkdown(item.text)}
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <p
                    key={iIndex}
                    className="text-xs text-slate-300 leading-relaxed"
                  >
                    {parseInlineMarkdown(item.text)}
                  </p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
