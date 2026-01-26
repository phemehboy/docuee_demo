"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionProps } from "framer-motion";
import { X, Smile } from "lucide-react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import TextareaAutosize from "react-textarea-autosize";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import dayjs from "dayjs";

import { createPortal } from "react-dom";
import { DrawerSelect } from "../drawer/DrawerSelect";
import clsx from "clsx";

function getPortalRoot() {
  if (typeof window === "undefined") return null;

  let root = document.getElementById("chat-drawer-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "chat-drawer-root";
    document.body.appendChild(root);
  }
  return root;
}

function groupMessagesByDate(messages: any[]) {
  return messages.reduce((groups: Record<string, any[]>, message: any) => {
    const dateKey = dayjs(message.timestamp).format("YYYY-MM-DD");
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(message);
    return groups;
  }, {});
}

type Role = "schoolAdmin" | "instructor" | "student" | "supervisor";
type CtxType = "direct" | "course" | "project";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userPicture?: string;
  senderId: string; // current user
  recipientId: string; // chat partner
  userType?: Role; // sender's role (optional if you infer elsewhere)
  recipientUserType: Role;
  page?: string;

  // Optional default context hint (we still allow switching)
  contextType?: Exclude<CtxType, "direct"> | "direct";
  contextId?: string;
  getApprovedProjectTitle?: () => string;
  courseTitle?: string;
  readOnly?: boolean;
}

function isOnlyEmoji(text: string) {
  // Remove whitespace and check if remaining is only emojis
  const stripped = text.replace(/\s/g, "");
  return (
    stripped.length > 0 &&
    [...stripped].every((char) =>
      /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(char),
    )
  );
}

function isSingleEmoji(text: string) {
  const stripped = text.replace(/\s/g, "");
  // Check if length is 2 because some emojis are surrogate pairs
  return (
    stripped.length > 0 &&
    [...stripped].every((char) =>
      /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(char),
    ) &&
    [...stripped].length === 1
  ); // only 1 emoji
}

export default function ChatDrawer({
  isOpen,
  onClose,
  userName,
  userPicture,
  senderId,
  recipientId,
  userType,
  recipientUserType,
  page,
  contextType,
  contextId,
  getApprovedProjectTitle,
  courseTitle,
  readOnly,
}: ChatDrawerProps) {
  const client = useConvex();

  // If contextType and contextId are provided, the drawer is scoped
  const isScoped = !!(contextType && contextId);

  // ---------- HYBRID FILTER ----------
  type Filter =
    | { kind: "all" }
    | { kind: "direct" }
    | { kind: "project"; id: string }
    | { kind: "course"; id: string };

  const [filter, setFilter] = useState<Filter>(
    isScoped
      ? contextType === "project"
        ? { kind: "project", id: contextId! }
        : contextType === "course"
          ? { kind: "course", id: contextId! }
          : { kind: "direct" }
      : { kind: "all" },
  );

  const effectiveContextType: CtxType | undefined =
    filter.kind === "all"
      ? undefined
      : filter.kind === "direct"
        ? "direct"
        : (filter.kind as "project" | "course");

  const effectiveContextId: string | undefined =
    "id" in filter ? filter.id : undefined;

  // ---------- Chat state ----------
  const [message, setMessage] = useState("");
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setPortalRoot(getPortalRoot());
  }, []);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [sending, setSending] = useState(false);
  const [newMessageArrived, setNewMessageArrived] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

  const sendMessage = useMutation(api.messages.sendMessage.sendMessage);
  const markMessagesAsRead = useMutation(
    api.messages.sendMessage.markMessagesAsRead,
  );
  const setTypingStatus = useMutation(api.messages.sendMessage.setTyping);
  const markAsDelivered = useMutation(
    api.messages.sendMessage.markMessagesAsDelivered,
  );

  // All/filtered messages (HYBRID)
  const messages = useQuery(api.messages.sendMessage.listMessages, {
    userA: senderId,
    userB: recipientId,
    contextType: effectiveContextType,
    contextId: effectiveContextId,
  });

  // Distinct contexts for filter chips
  const contexts = useQuery(api.messages.sendMessage.listConversationContexts, {
    userA: senderId,
    userB: recipientId,
  });

  const typingStatus = useQuery(api.messages.sendMessage.getTypingStatus, {
    from: recipientId,
    to: senderId,
  });

  const groupedMessages = groupMessagesByDate(messages || []);
  const dateKeys = Object.keys(groupedMessages).sort();

  // Mark chat active/inactive
  useEffect(() => {
    if (!client) return;
    const setActive = async (isActive: boolean) => {
      try {
        await client.mutation(api.activeChats.setChatActive, {
          userId: senderId,
          otherUserId: recipientId,
          isActive,
        });
      } catch (err) {
        console.error("Failed to set chat active status:", err);
      }
    };
    if (isOpen) setActive(true);
    return () => {
      setActive(false);
    };
  }, [isOpen, client, senderId, recipientId]);

  const handleSend = async () => {
    if (sending || !message.trim()) return;
    setSending(true);

    try {
      const content = message.trim();

      const ctxTypeForSend = effectiveContextType ?? "direct";
      const ctxIdForSend =
        ctxTypeForSend === "direct" ? undefined : effectiveContextId;

      // 1. 🚀 Fire off the message send immediately (await only this)
      await sendMessage({
        from: senderId,
        to: recipientId,
        content,
        contextType: ctxTypeForSend,
        contextId: ctxIdForSend,
        senderRole: (userType ?? "student") as Role,
      });

      // Optimistic UI update
      setMessage("");
      setShowEmojiPicker(false);

      // 2. 🎯 Notification check runs in the background
      (async () => {
        try {
          const isRecipientActive = await client.query(
            api.activeChats.isChatActive,
            { userId: recipientId, otherUserId: senderId },
          );

          if (!isRecipientActive) {
            const notificationTitle =
              ctxTypeForSend === "course"
                ? "New course message"
                : ctxTypeForSend === "project"
                  ? "New project message"
                  : "New message";

            const qs = new URLSearchParams({
              openChat: "1",
              with: senderId,
              contextType: ctxTypeForSend,
              ...(ctxIdForSend ? { contextId: ctxIdForSend } : {}),
            }).toString();

            let actionLink: string;

            if (ctxTypeForSend === "course" && ctxIdForSend) {
              actionLink = `/user/${recipientId}/usertype/${recipientUserType}/dashboard/courses/course/${ctxIdForSend}?${qs}`;
            } else if (ctxTypeForSend === "project" && ctxIdForSend) {
              actionLink =
                recipientUserType === "student"
                  ? `/user/${recipientId}/usertype/${recipientUserType}/dashboard?${qs}`
                  : `/user/${recipientId}/usertype/${recipientUserType}/dashboard/projects?${qs}`;
            } else if (ctxTypeForSend === "direct") {
              actionLink = `/user/${recipientId}/usertype/${recipientUserType}/dashboard/messages?${qs}`;
            } else {
              actionLink = `/user/${recipientId}/usertype/${recipientUserType}/dashboard/${page ?? ""}?${qs}`;
            }

            await fetch("/api/notifications/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: notificationTitle,
                message:
                  content.length > 50 ? content.slice(0, 50) + "..." : content,
                type: "chat_message",
                userId: recipientId,
                actionLink,
              }),
            });
          }
        } catch (err) {
          console.error("Notification send failed:", err);
        }
      })();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (val: string) => {
    setMessage(val);
    setTypingStatus({ from: senderId, to: recipientId, isTyping: true });
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(() => {
        setTypingStatus({ from: senderId, to: recipientId, isTyping: false });
      }, 1500),
    );
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 30; // small threshold
    setIsAtBottom(atBottom);

    // Show button ONLY if not at bottom
    setShowScrollDown(!atBottom);

    // Active date logic
    const children = Array.from(scrollRef.current.children);
    for (let child of children) {
      if (child instanceof HTMLElement && child.dataset.date) {
        const rect = child.getBoundingClientRect();
        if (rect.top > 40) break;
        setActiveDate(child.dataset.date);
      }
    }
    if (atBottom) setActiveDate(null);

    if (atBottom) setNewMessageArrived(false);
  };

  const courseContexts =
    contexts?.filter((c) => c.contextType === "course" && c.contextId) || [];
  const projectContexts =
    contexts?.filter((c) => c.contextType === "project" && c.contextId) || [];

  // Watch for new messages
  useEffect(() => {
    if (!messages) return;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    // If user is not at bottom, pulse button
    if (!isAtBottom) setNewMessageArrived(true);

    // Auto scroll if at bottom
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setNewMessageArrived(false);
    }
  }, [messages]);

  // Mark as delivered & read
  useEffect(() => {
    if (isOpen && messages?.length) {
      markAsDelivered({ from: recipientId, to: senderId });
    }
  }, [messages]);

  useEffect(() => {
    if (!messages || !isOpen) return;
    const hasUnread = messages.some((m) => m.from === recipientId && !m.read);
    if (hasUnread) markMessagesAsRead({ from: recipientId, to: senderId });
  }, [messages, isOpen]);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingStatus]);

  useEffect(() => {
    if (isOpen && inputRef.current)
      setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    const setDynamicHeight = () => {
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--drawer-height",
          `${window.innerHeight}px`,
        );
      });
    };

    setDynamicHeight();
    window.addEventListener("resize", setDynamicHeight);
    window.addEventListener("orientationchange", setDynamicHeight);

    return () => {
      window.removeEventListener("resize", setDynamicHeight);
      window.removeEventListener("orientationchange", setDynamicHeight);
    };
  }, []);

  // Decide what to display
  const chatLabel = () => {
    if (contextType === "project") {
      const title = getApprovedProjectTitle?.();
      return title ? `Project: ${title}` : "Project (not approved yet)";
    }

    if (contextType === "course") {
      return `Course: ${courseTitle || "Untitled course"}`;
    }

    if (contextType === "direct") {
      return `Chat with ${userName || "someone"}`;
    }

    // Default: hybrid chat
    return "Hybrid chat · multiple contexts";
  };

  // --- simple helper to render filter chips ---
  const FilterChip = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={typeof children === "string" ? children : undefined}
      className={`max-w-[150px] truncate px-2 py-1 text-xs rounded-full border mr-2 mb-2
      ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );

  if (!portalRoot) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={drawerRef}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 20 }}
          className="z-[9999] fixed top-0 right-0 w-full sm:w-[420px]
                   bg-gradient-to-b from-white to-blue-50
                   p-4 shadow-2xl border-l border-gray-200 flex flex-col pointer-events-auto "
          style={{ height: "var(--drawer-height)" }}
          {...({} as MotionProps & React.HTMLAttributes<HTMLDivElement>)}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <img
                src={userPicture || "/default-avatar.png"}
                alt={userName}
                width={40}
                height={40}
                className="w-[40px] h-[40px] rounded-full object-cover ring-2 ring-blue-500"
              />
              <div>
                <h2 className="font-semibold text-blue-800">{userName}</h2>
                <div className="text-xs text-gray-500">{chatLabel()}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-black cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Context filter chips */}
          {!isScoped && (
            <div className="px-1 pb-3 flex flex-wrap gap-2 items-center">
              {/* All & Direct chips */}
              <FilterChip
                active={filter.kind === "all"}
                onClick={() => setFilter({ kind: "all" })}
              >
                All
              </FilterChip>

              <FilterChip
                active={filter.kind === "direct"}
                onClick={() => setFilter({ kind: "direct" })}
              >
                Direct
              </FilterChip>

              {projectContexts.length > 0 && (
                <DrawerSelect
                  value={filter.kind === "project" ? (filter.id ?? "") : ""}
                  active={filter.kind === "project"}
                  placeholder="Select a project"
                  label="Projects"
                  onValueChange={(value) =>
                    setFilter(
                      value ? { kind: "project", id: value } : { kind: "all" },
                    )
                  }
                  options={projectContexts
                    .filter((p) => !!p.contextId)
                    .map((p) => ({
                      value: p.contextId!,
                      label: `${
                        p.contextName.length > 40
                          ? p.contextName.slice(0, 37) + "..."
                          : p.contextName
                      } • ${p.count}`,
                    }))}
                />
              )}

              {courseContexts.length > 0 && (
                <DrawerSelect
                  value={filter.kind === "course" ? (filter.id ?? "") : ""}
                  active={filter.kind === "course"}
                  placeholder="Select a course"
                  label="Courses"
                  onValueChange={(value) =>
                    setFilter(
                      value ? { kind: "course", id: value } : { kind: "all" },
                    )
                  }
                  options={courseContexts
                    .filter((c) => !!c.contextId)
                    .map((c) => ({
                      value: c.contextId!,
                      label: `${
                        c.contextName.length > 40
                          ? c.contextName.slice(0, 37) + "..."
                          : c.contextName
                      } • ${c.count}`,
                    }))}
                />
              )}
            </div>
          )}

          {/* Messages */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 pb-4 hide-scrollbar relative"
          >
            {activeDate && (
              <div className="sticky top-1 z-10 flex justify-center">
                <div className="bg-white/80 backdrop-blur py-1 px-3 text-sm text-gray-600 rounded inline-block">
                  {dayjs(activeDate).isSame(dayjs(), "day")
                    ? "Today"
                    : dayjs(activeDate).isSame(
                          dayjs().subtract(1, "day"),
                          "day",
                        )
                      ? "Yesterday"
                      : dayjs(activeDate).format("MMMM D, YYYY")}
                </div>
              </div>
            )}

            {!messages ? (
              <p className="text-sm text-gray-400">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-gray-400">No messages yet</p>
            ) : (
              dateKeys.map((date) => (
                <div key={date} data-date={date}>
                  <div className="text-center text-xs font-medium text-gray-500 my-4">
                    {dayjs(date).isSame(dayjs(), "day")
                      ? "Today"
                      : dayjs(date).isSame(dayjs().subtract(1, "day"), "day")
                        ? "Yesterday"
                        : dayjs(date).format("MMMM D, YYYY")}
                  </div>

                  {groupedMessages[date].map((msg: any, idx: number) => {
                    const prevMsg = groupedMessages[date][idx - 1];
                    const isNewSender = !prevMsg || prevMsg.from !== msg.from;

                    const onlyEmoji = isOnlyEmoji(msg.content);
                    const singleEmoji = isSingleEmoji(msg.content);

                    return (
                      <motion.div
                        key={`${msg._id}-${msg.timestamp}`}
                        className={`relative flex max-w-[80%] text-sm whitespace-pre-line wrap-break-words transition
    ${msg.from === senderId ? "ml-auto justify-end" : "mr-auto justify-start"}
  `}
                        style={{ marginTop: isNewSender ? "0.6rem" : "0.2rem" }}
                        {...({} as MotionProps &
                          React.HTMLAttributes<HTMLDivElement>)}
                      >
                        <div
                          className={`
      px-3 py-2 rounded-2xl shadow-sm relative
      ${
        msg.from === senderId
          ? singleEmoji
            ? "bg-transparent text-4xl"
            : "bg-blue-600 text-white rounded-br-none"
          : onlyEmoji
            ? "bg-transparent text-4xl "
            : "bg-gray-200 text-gray-800 rounded-bl-none"
      }
    `}
                          style={{
                            lineHeight: singleEmoji ? "2.6rem" : "1.4rem",
                            fontSize: singleEmoji ? "2.2rem" : "1rem",
                          }}
                        >
                          {msg.content}

                          {/* Timestamp & ticks */}
                          <div
                            className={`flex items-center gap-1 text-[10px] ${
                              singleEmoji
                                ? "justify-center mt-1"
                                : "justify-end mt-1"
                            }`}
                          >
                            <span
                              className={`${
                                msg.from === senderId
                                  ? "text-gray-500"
                                  : "text-gray-500"
                              }`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {msg.from === senderId && (
                              <span
                                className={
                                  msg.read
                                    ? "text-blue-400"
                                    : msg.delivered
                                      ? "text-gray-200"
                                      : "text-yellow-400"
                                }
                              >
                                {msg.read ? "✔✔" : msg.delivered ? "✔" : "⏳"}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))
            )}

            {typingStatus?.isTyping && (
              <div className="ml-2 mt-2 flex items-center gap-2 text-xs text-gray-500">
                <div className="bg-gray-300 px-3 py-2 rounded-2xl animate-pulse">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
            {/* 🔽 Floating Scroll-to-Bottom Button */}

            {showScrollDown && (
              <button
                onClick={() => {
                  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                  setNewMessageArrived(false);
                }}
                className={`absolute bottom-20 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition
      ${newMessageArrived ? "animate-pulse" : ""}`}
              >
                ↓
              </button>
            )}
          </div>

          {/* Input */}
          <div className="pt-4 border-t border-gray-200 bg-white px-4 pb-4">
            {readOnly ? (
              <div className=" text-center text-xs text-gray-400 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                🛈 You cannot message your school admin directly but you can
                receive messages.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-end gap-2 relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    !readOnly && setShowEmojiPicker(!showEmojiPicker)
                  }
                  className={`text-gray-600 hover:text-gray-800 ${readOnly ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <Smile className="w-5 h-5" />
                </button>

                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute bottom-16 left-0 z-10 bg-white rounded-xl shadow-lg p-2 space-y-2"
                    {...({} as MotionProps &
                      React.HTMLAttributes<HTMLDivElement>)}
                  >
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowEmojiPicker(false)}
                        className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-800 transition cursor-pointer"
                        aria-label="Close Emoji Picker"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Picker
                      data={data}
                      onEmojiSelect={(emoji: any) =>
                        setMessage((prev) => prev + emoji.native)
                      }
                      theme="light"
                    />
                  </motion.div>
                )}

                <TextareaAutosize
                  ref={inputRef}
                  value={message}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder="Type a message..."
                  maxRows={5}
                  // className="text-black flex-1 border border-gray-300 rounded-2xl px-4 py-2 text-sm focus:outline-none resize-none bg-white shadow-md hide-scrollbar"
                  disabled={readOnly} // disable input when readOnly
                  className={`text-black flex-1 border border-gray-300 rounded-2xl px-4 py-2 text-sm focus:outline-none resize-none shadow-md hide-scrollbar
    ${readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || sending || readOnly}
                  className={clsx(
                    "bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition shadow",
                    sending ? "" : "cursor-pointer",
                  )}
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalRoot,
  );
}
