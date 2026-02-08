"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Reply, X, Crown, Shield, User } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getGroupMessages, sendGroupMessage } from "@/lib/supabase/queries";

type MessageUser = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

type Message = {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  reply_to: string | null;
  created_at: string;
  users: MessageUser;
};

type MemberInfo = {
  user_id: string;
  role: string;
  users: MessageUser;
};

interface GroupChatProps {
  groupId: string;
  userId: string;
  members: MemberInfo[];
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

function shouldShowDateSeparator(current: Message, previous: Message | null) {
  if (!previous) return true;
  const currentDate = new Date(current.created_at).toDateString();
  const previousDate = new Date(previous.created_at).toDateString();
  return currentDate !== previousDate;
}

export function GroupChat({ groupId, userId, members }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [replyTo, setReplyTo] = useState<{ id: string; username: string; content: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const memberRoles = useRef(
    new Map(members.map((m) => [m.user_id, m.role]))
  ).current;

  const memberUsers = useRef(
    new Map(members.map((m) => [m.user_id, m.users]))
  ).current;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Normalize Supabase join data (users may be array or object)
  function normalizeMessages(data: Record<string, unknown>[]): Message[] {
    return data.map((msg) => {
      const users = msg.users;
      return {
        ...(msg as unknown as Message),
        users: Array.isArray(users) ? users[0] : users,
      } as Message;
    });
  }

  // Load initial messages
  useEffect(() => {
    async function load() {
      try {
        const data = await getGroupMessages(groupId, 50);
        setMessages(normalizeMessages(data));
        setHasMore(data.length === 50);
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [groupId]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Attach user info from members cache
          const userInfo = memberUsers.get(newMsg.user_id);
          if (userInfo) {
            newMsg.users = userInfo;
          } else {
            newMsg.users = { id: newMsg.user_id, username: "Utilisateur", avatar_url: null };
          }
          setMessages((prev) => {
            // Avoid duplicates (from own send)
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (isNearBottomRef.current) {
            setTimeout(scrollToBottom, 50);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, scrollToBottom, memberUsers]);

  // Track scroll position
  function handleScroll() {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 100;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }

  // Load older messages
  async function loadMore() {
    if (loadingMore || !hasMore || messages.length === 0) return;
    setLoadingMore(true);
    const el = scrollContainerRef.current;
    const prevScrollHeight = el?.scrollHeight || 0;

    try {
      const oldest = messages[0].created_at;
      const older = await getGroupMessages(groupId, 50, oldest);
      setHasMore(older.length === 50);
      setMessages((prev) => [...normalizeMessages(older), ...prev]);

      // Restore scroll position
      requestAnimationFrame(() => {
        if (el) {
          el.scrollTop = el.scrollHeight - prevScrollHeight;
        }
      });
    } catch (err) {
      console.error("Error loading more messages:", err);
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");
    const replyId = replyTo?.id;
    setReplyTo(null);

    try {
      await sendGroupMessage(groupId, userId, text, replyId);
      // Message will appear via realtime
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error sending message:", err);
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleReply(msg: Message) {
    setReplyTo({
      id: msg.id,
      username: msg.users?.username || "Utilisateur",
      content: msg.content,
    });
  }

  function getRoleBadge(uid: string) {
    const role = memberRoles.get(uid);
    if (role === "owner") return <Crown className="w-3 h-3 text-amber-500" />;
    if (role === "admin") return <Shield className="w-3 h-3 text-blue-500" />;
    return null;
  }

  function getReplyPreview(replyToId: string) {
    const original = messages.find((m) => m.id === replyToId);
    if (!original) return null;
    return {
      username: original.users?.username || "Utilisateur",
      content: original.content.length > 60 ? original.content.slice(0, 60) + "..." : original.content,
    };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-white dark:bg-primary-800/50 rounded-2xl border border-parchment-200 dark:border-primary-700/50 overflow-hidden">
      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
      >
        {/* Load more button */}
        {hasMore && (
          <div className="text-center py-2">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="text-xs text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              {loadingMore ? "Chargement..." : "Charger les messages precedents"}
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-primary-400 dark:text-primary-500 text-sm">
            Aucun message. Commencez la conversation !
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.user_id === userId;
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showDate = shouldShowDateSeparator(msg, prevMsg);
            const replyPreview = msg.reply_to ? getReplyPreview(msg.reply_to) : null;

            return (
              <div key={msg.id}>
                {/* Date separator */}
                {showDate && (
                  <div className="flex items-center justify-center py-3">
                    <span className="text-xs text-primary-400 dark:text-primary-500 bg-parchment-100 dark:bg-primary-700/50 px-3 py-1 rounded-full">
                      {formatDateSeparator(msg.created_at)}
                    </span>
                  </div>
                )}

                {/* Message */}
                <div className={`flex ${isOwn ? "justify-end" : "justify-start"} group mb-1`}>
                  <div className={`flex gap-2 max-w-[80%] ${isOwn ? "flex-row-reverse" : ""}`}>
                    {/* Avatar (only for others) */}
                    {!isOwn && (
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-700/50 flex-shrink-0 flex items-center justify-center overflow-hidden mt-auto">
                        {msg.users?.avatar_url ? (
                          <Image
                            src={msg.users.avatar_url}
                            alt=""
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-primary-400 dark:text-primary-500" />
                        )}
                      </div>
                    )}

                    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                      {/* Username + role (only for others, and only if different from previous sender) */}
                      {!isOwn && (!prevMsg || prevMsg.user_id !== msg.user_id || showDate) && (
                        <div className="flex items-center gap-1 mb-0.5 px-1">
                          <span className="text-xs font-medium text-primary-600 dark:text-primary-300">
                            {msg.users?.username || "Utilisateur"}
                          </span>
                          {getRoleBadge(msg.user_id)}
                        </div>
                      )}

                      {/* Reply preview */}
                      {replyPreview && (
                        <div
                          className={`text-xs px-2 py-1 mb-0.5 rounded-lg border-l-2 ${
                            isOwn
                              ? "bg-primary-500/20 border-primary-300 text-primary-100"
                              : "bg-parchment-100 dark:bg-primary-700/30 border-primary-400 text-primary-500 dark:text-primary-400"
                          }`}
                        >
                          <span className="font-medium">{replyPreview.username}</span>
                          <p className="truncate">{replyPreview.content}</p>
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`relative px-3 py-2 rounded-2xl text-sm break-words ${
                          isOwn
                            ? "bg-primary-600 text-white rounded-br-md"
                            : "bg-parchment-100 dark:bg-primary-700/50 text-primary-800 dark:text-parchment-100 rounded-bl-md"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <span
                          className={`text-[10px] mt-1 block ${
                            isOwn ? "text-primary-200" : "text-primary-400 dark:text-primary-500"
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </span>
                      </div>

                      {/* Reply button */}
                      <button
                        onClick={() => handleReply(msg)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 p-1 text-primary-400 hover:text-primary-600 dark:text-primary-500 dark:hover:text-primary-300"
                        title="Repondre"
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply bar */}
      {replyTo && (
        <div className="px-4 py-2 bg-parchment-50 dark:bg-primary-800 border-t border-parchment-200 dark:border-primary-700/50 flex items-center gap-2">
          <Reply className="w-4 h-4 text-primary-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-primary-600 dark:text-primary-300">
              {replyTo.username}
            </span>
            <p className="text-xs text-primary-400 dark:text-primary-500 truncate">
              {replyTo.content}
            </p>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="p-1 text-primary-400 hover:text-primary-600 dark:text-primary-500 dark:hover:text-primary-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 bg-white dark:bg-primary-850 border-t border-parchment-200 dark:border-primary-700/50">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 1000))}
            onKeyDown={handleKeyDown}
            placeholder="Ecrire un message..."
            aria-label="Message"
            rows={1}
            className="flex-1 resize-none bg-parchment-50 dark:bg-primary-800 border border-parchment-200 dark:border-primary-700/50 rounded-xl px-3 py-2 text-sm text-primary-800 dark:text-parchment-100 placeholder-primary-400 dark:placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 max-h-24"
            style={{ minHeight: "40px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            aria-label="Envoyer le message"
            className="p-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
