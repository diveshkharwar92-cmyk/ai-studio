import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  Check,
  Copy,
  History,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { type ChatMessageView, ChatRole, createActor } from "@/backend";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { timestampToDate, useConversations } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";

function useCreateConversation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createConversation(title);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

function useDeleteConversation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteConversation(conversationId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-a:text-primary prose-blockquote:text-muted-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:text-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1"
      aria-label="Assistant is typing"
      data-ocid="chat.loading_state"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="bg-muted-foreground size-1.5 animate-pulse-soft rounded-full"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function formatTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatPage() {
  const { actor } = useActor(createActor);
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const { data: queryConversations, isLoading: loadingConversations } =
    useConversations();

  const [activeId, setActiveId] = useState<bigint | null>(null);
  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [providerNotice, setProviderNotice] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<bigint>>(new Set());
  const [historyOpen, setHistoryOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<bigint | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const conversations = (queryConversations ?? []).filter(
    (conversation) => !deletedIds.has(conversation.id),
  );

  useEffect(() => {
    if (activeId === null) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }
    let cancelled = false;
    setMessages([]);
    setLoadingMessages(true);
    actor
      ?.listMessages(activeId)
      .then((loaded) => {
        if (!cancelled) {
          setMessages(loaded);
          setLoadingMessages(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingMessages(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeId, actor]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const shouldScroll = messages.length > 0 || isStreaming;
    if (shouldScroll) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isStreaming]);

  const handleNewChat = () => {
    setActiveId(null);
    setMessages([]);
    setProviderNotice(false);
    setHistoryOpen(false);
  };

  const handleSelectConversation = (id: bigint) => {
    setActiveId(id);
    setProviderNotice(false);
    setHistoryOpen(false);
  };

  const handleDeleteConversation = (id: bigint) => {
    deleteConversation.mutate(id, {
      onSuccess: (deleted) => {
        if (!deleted) {
          toast.error("Could not delete conversation");
          return;
        }
        setDeletedIds((prev) => new Set(prev).add(id));
        if (activeId === id) {
          setActiveId(null);
          setMessages([]);
          setProviderNotice(false);
        }
        toast.success("Conversation deleted");
      },
      onError: () => {
        toast.error("Could not delete conversation");
      },
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !actor || isStreaming) return;
    setInput("");
    setProviderNotice(false);

    let conversationId = activeId;
    if (conversationId === null) {
      const conversation = await createConversation.mutateAsync(
        text.slice(0, 40),
      );
      conversationId = conversation.id;
      setActiveId(conversation.id);
    }

    const userMessage = await actor.addMessage(conversationId, text);
    if (userMessage) setMessages((prev) => [...prev, userMessage]);

    setIsStreaming(true);
    try {
      const result = await actor.chat(conversationId, text);
      if (result.__kind__ === "ok") {
        const assistantMessage = await actor.addMessage(
          conversationId,
          result.ok.message,
        );
        if (assistantMessage)
          setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setProviderNotice(true);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleRegenerate = async () => {
    if (!actor || isStreaming || activeId === null) return;
    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === ChatRole.user);
    if (!lastUserMessage) return;

    setMessages((prev) => {
      const next = [...prev];
      if (
        next.length > 0 &&
        next[next.length - 1].role === ChatRole.assistant
      ) {
        next.pop();
      }
      return next;
    });
    setProviderNotice(false);
    setIsStreaming(true);
    try {
      const result = await actor.chat(activeId, lastUserMessage.content);
      if (result.__kind__ === "ok") {
        const assistantMessage = await actor.addMessage(
          activeId,
          result.ok.message,
        );
        if (assistantMessage)
          setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setProviderNotice(true);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopy = async (message: ChatMessageView) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      toast.success("Response copied to clipboard");
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Could not copy response");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
      <PageHeader
        title="AI Chat"
        description="Have natural, context-aware conversations with your assistant."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            type="button"
            className="lg:hidden"
            onClick={() => setHistoryOpen((open) => !open)}
            data-ocid="chat.history_toggle_button"
          >
            <History />
            {historyOpen ? "Chat" : "History"}
          </Button>
          <Button
            type="button"
            onClick={handleNewChat}
            data-ocid="chat.new_chat_button"
          >
            <Plus />
            New chat
          </Button>
        </div>
      </PageHeader>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[280px_1fr]">
        <aside
          data-ocid="chat.history_panel"
          className={cn(
            "min-h-0 flex-col gap-2",
            "hidden lg:flex",
            historyOpen && "flex",
          )}
        >
          <div className="bg-card border shadow-subtle flex min-h-0 flex-1 flex-col rounded-xl">
            <div className="border-b px-4 py-3">
              <h2 className="font-display text-sm font-semibold">
                Conversation history
              </h2>
            </div>
            <ScrollArea className="min-h-0 flex-1">
              <div className="flex flex-col gap-1 p-2">
                {loadingConversations ? (
                  Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map(
                    (id) => <Skeleton key={id} className="h-9 w-full" />,
                  )
                ) : conversations.length === 0 ? (
                  <div className="text-muted-foreground px-3 py-6 text-center text-sm">
                    No conversations yet. Start a new chat to begin.
                  </div>
                ) : (
                  conversations.map((conversation, index) => (
                    <div
                      key={conversation.id}
                      data-ocid={`chat.conversation_item.${index}`}
                      className={cn(
                        "group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors",
                        activeId === conversation.id
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectConversation(conversation.id)
                        }
                        className="min-w-0 flex-1 truncate text-left text-sm font-medium"
                      >
                        {conversation.title}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteConversation(conversation.id)
                        }
                        aria-label={`Delete conversation ${conversation.title}`}
                        data-ocid={`chat.conversation_delete.${index}`}
                        className="text-muted-foreground hover:text-destructive rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </aside>

        <section
          data-ocid="chat.messages_panel"
          className={cn(
            "min-h-0 flex-col",
            "flex",
            historyOpen && "hidden lg:flex",
          )}
        >
          <div className="bg-card border shadow-subtle flex min-h-0 flex-1 flex-col rounded-xl">
            <ScrollArea className="min-h-0 flex-1">
              <div
                ref={scrollRef}
                className="flex flex-col gap-4 px-4 py-6 sm:px-6"
              >
                {activeId === null ? (
                  <EmptyState
                    icon={MessageSquare}
                    title="Start a conversation"
                    description="Ask a question or describe what you need. Your assistant will respond with helpful, context-aware answers."
                    className="my-auto"
                  />
                ) : loadingMessages ? (
                  <div className="flex flex-col gap-4">
                    {Array.from(
                      { length: 3 },
                      (_, i) => `msg-skeleton-${i}`,
                    ).map((id) => (
                      <Skeleton key={id} className="h-16 w-2/3" />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-muted-foreground my-auto text-center text-sm">
                    Send a message to begin this conversation.
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isUser = message.role === ChatRole.user;
                    return (
                      <div
                        key={message.id}
                        data-ocid={`chat.message_item.${index}`}
                        className={cn(
                          "flex w-full gap-3",
                          isUser ? "justify-end" : "justify-start",
                        )}
                      >
                        {!isUser && (
                          <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
                            <Bot className="size-4" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "flex max-w-[85%] flex-col gap-1.5",
                            isUser ? "items-end" : "items-start",
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2.5 text-sm",
                              isUser
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted rounded-bl-sm",
                            )}
                          >
                            {isUser ? (
                              <p className="whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            ) : (
                              <Markdown content={message.content} />
                            )}
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-1",
                              isUser ? "flex-row-reverse" : "flex-row",
                            )}
                          >
                            <span className="text-muted-foreground px-1 text-[11px]">
                              {formatTime(message.createdAt)}
                            </span>
                            {!isUser && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void handleCopy(message)}
                                  aria-label="Copy response"
                                  data-ocid={`chat.copy_button.${index}`}
                                  className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
                                >
                                  {copiedId === message.id ? (
                                    <Check className="size-3.5" />
                                  ) : (
                                    <Copy className="size-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleRegenerate()}
                                  aria-label="Regenerate response"
                                  data-ocid={`chat.regenerate_button.${index}`}
                                  className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
                                >
                                  <RefreshCw className="size-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {isStreaming && (
                  <div className="flex w-full gap-3">
                    <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
                      <Bot className="size-4" />
                    </div>
                    <div className="bg-muted flex items-center rounded-2xl rounded-bl-sm px-4 py-3">
                      <TypingIndicator />
                    </div>
                  </div>
                )}

                {providerNotice && (
                  <div
                    data-ocid="chat.provider_notice"
                    className="bg-accent/10 text-accent-foreground flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm"
                  >
                    <MessageSquare className="mt-0.5 size-4 shrink-0" />
                    <p>
                      AI provider is not configured yet. Add the required API
                      key to enable this feature.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-3">
              <div className="bg-background border shadow-subtle flex items-end gap-2 rounded-xl p-2">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  rows={1}
                  disabled={isStreaming}
                  className="min-h-10 max-h-40 resize-none border-0 bg-transparent focus-visible:ring-0"
                  data-ocid="chat.input"
                />
                <Button
                  type="button"
                  size="icon"
                  disabled={!input.trim() || isStreaming}
                  onClick={() => void handleSend()}
                  aria-label="Send message"
                  data-ocid="chat.send_button"
                >
                  <Send />
                </Button>
              </div>
              <p className="text-muted-foreground mt-2 text-center text-xs">
                Press Enter to send, Shift + Enter for a new line.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
