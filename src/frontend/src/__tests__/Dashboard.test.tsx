import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderApp } from "./test-utils";

const { mockActor } = vi.hoisted(() => ({
  mockActor: {
    listProjects: vi.fn().mockResolvedValue([]),
    listFiles: vi.fn().mockResolvedValue([]),
    listConversations: vi.fn().mockResolvedValue([]),
    listMessages: vi.fn().mockResolvedValue([]),
    listGenerations: vi.fn().mockResolvedValue([]),
    createConversation: vi.fn(),
    deleteConversation: vi.fn().mockResolvedValue(true),
    addMessage: vi.fn(),
    chat: vi.fn(),
    generateImage: vi.fn(),
    saveFile: vi.fn(),
    getUserSettings: vi.fn().mockResolvedValue(null),
    updateUserSettings: vi.fn(),
    getSubscription: vi.fn().mockResolvedValue(null),
    createProject: vi.fn(),
    renameProject: vi.fn(),
    deleteProject: vi.fn(),
    getCallerUserRole: vi.fn().mockResolvedValue("user"),
    isCallerAdmin: vi.fn().mockResolvedValue(false),
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

const TOOL_NAMES = [
  "AI Chat",
  "Text to Video",
  "Text to Image",
  "Image to Video",
  "AI Image Editor",
  "AI Video Editor",
  "Video to Anime",
  "Text to Speech",
  "Speech to Text",
  "AI Writer",
  "AI Translator",
  "AI Study Assistant",
  "AI Idea Generator",
];

describe("Dashboard", () => {
  it("renders all 13 tool cards with title, description, and Open button", async () => {
    renderApp();

    const heading = await screen.findByRole("heading", { name: /AI Tools/i });
    expect(heading).toBeInTheDocument();

    // Every tool name appears at least once (the available tools also appear in
    // the "Quick access" section, so a name may match more than once).
    for (const name of TOOL_NAMES) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }

    // Each tool card exposes a button keyed by its id.
    for (const id of [
      "chat",
      "text-to-video",
      "image",
      "image-to-video",
      "image-editor",
      "video-editor",
      "video-to-anime",
      "text-to-speech",
      "speech-to-text",
      "writer",
      "translator",
      "study-assistant",
      "idea-generator",
    ]) {
      expect(screen.getByTestId(`tool.${id}.button`)).toBeInTheDocument();
    }
  });

  it("filters tools by search query", async () => {
    const user = userEvent.setup();
    renderApp();

    const search = await screen.findByRole("searchbox", {
      name: /Search tools/i,
    });
    await user.type(search, "chat");

    expect(screen.getAllByText("AI Chat").length).toBeGreaterThan(0);
    // "Text to Video" is a coming-soon tool that only appears in the AI Tools
    // grid, so it is filtered out by the search.
    expect(screen.queryByText("Text to Video")).not.toBeInTheDocument();
  });

  it("shows an empty state when no tools match the search", async () => {
    const user = userEvent.setup();
    renderApp();

    const search = await screen.findByRole("searchbox", {
      name: /Search tools/i,
    });
    await user.type(search, "zzzz");

    expect(screen.getByText(/No tools match "zzzz"/i)).toBeInTheDocument();
  });
});
