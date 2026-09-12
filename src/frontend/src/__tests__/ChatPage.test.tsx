import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatPage } from "@/pages/ChatPage";

const { mockActor } = vi.hoisted(() => ({
  mockActor: {
    listConversations: vi.fn().mockResolvedValue([]),
    listMessages: vi.fn().mockResolvedValue([]),
    createConversation: vi.fn(),
    deleteConversation: vi.fn().mockResolvedValue(true),
    addMessage: vi.fn(),
    chat: vi.fn(),
  },
}));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: mockActor, isFetching: false }),
  useInternetIdentity: () => ({
    isAuthenticated: false,
    login: vi.fn(),
    clear: vi.fn(),
  }),
  InternetIdentityProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

function renderChat() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ChatPage />
    </QueryClientProvider>,
  );
}

const userMessage = {
  id: 1n,
  content: "Hello there",
  owner: "aaaaa-aa",
  createdAt: 1_700_000_000_000_000n,
  role: "user",
  conversationId: 1n,
};

const assistantMessage = {
  id: 2n,
  content: "**Hi!** How can I help?",
  owner: "aaaaa-aa",
  createdAt: 1_700_000_000_000_000n,
  role: "assistant",
  conversationId: 1n,
};

const conversation = {
  id: 1n,
  title: "Hello there",
  owner: "aaaaa-aa",
  createdAt: 1_700_000_000_000_000n,
};

async function sendMessage(text: string) {
  const input = screen.getByPlaceholderText(/Type a message/i);
  fireEvent.change(input, { target: { value: text } });
  const send = screen.getByRole("button", { name: /Send message/i });
  fireEvent.click(send);
}

describe("ChatPage", () => {
  it("shows the setup message and never fabricates a reply when the provider is unconfigured", async () => {
    mockActor.createConversation.mockResolvedValue(conversation);
    mockActor.addMessage.mockResolvedValue(userMessage);
    mockActor.chat.mockResolvedValue({
      __kind__: "providerNotConfigured",
      providerNotConfigured: null,
    });
    // When the new conversation is selected, the backend reports the saved
    // user message (and no assistant reply).
    mockActor.listMessages.mockResolvedValue([userMessage]);

    renderChat();

    await sendMessage("Hello there");

    // The user's message is shown.
    expect(await screen.findByText("Hello there")).toBeInTheDocument();

    // The setup message appears and no assistant reply is fabricated.
    expect(
      await screen.findByText(/AI provider is not configured yet/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Hi!")).not.toBeInTheDocument();
  });

  it("renders a Markdown assistant response when the provider is configured", async () => {
    mockActor.createConversation.mockResolvedValue(conversation);
    mockActor.addMessage.mockResolvedValueOnce(userMessage);
    mockActor.addMessage.mockResolvedValueOnce(assistantMessage);
    mockActor.chat.mockResolvedValue({
      __kind__: "ok",
      ok: { message: "**Hi!** How can I help?" },
    });
    mockActor.listMessages.mockResolvedValue([userMessage, assistantMessage]);

    renderChat();

    await sendMessage("Hello there");

    // The Markdown **Hi!** is rendered as a <strong> element.
    const strong = await screen.findByText("Hi!", { selector: "strong" });
    expect(strong).toBeInTheDocument();
    expect(screen.queryByText(/AI provider is not configured yet/i)).toBeNull();
  });

  it("starts a new chat and clears the conversation", async () => {
    mockActor.createConversation.mockResolvedValue(conversation);
    mockActor.addMessage.mockResolvedValue(userMessage);
    mockActor.chat.mockResolvedValue({
      __kind__: "providerNotConfigured",
      providerNotConfigured: null,
    });
    mockActor.listMessages.mockResolvedValue([userMessage]);

    renderChat();

    await sendMessage("Hello there");
    await screen.findByText("Hello there");

    fireEvent.click(screen.getByRole("button", { name: /New chat/i }));

    // Back to the empty start state.
    await waitFor(() => {
      expect(screen.getByText(/Start a conversation/i)).toBeInTheDocument();
    });
  });
});
