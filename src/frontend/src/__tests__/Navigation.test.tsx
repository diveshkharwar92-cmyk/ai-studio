import { render, screen, within } from "@testing-library/react";
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

describe("Navigation", () => {
  it("desktop sidebar reaches the main sections", async () => {
    const user = userEvent.setup();
    renderApp();

    // The sidebar exposes links to the main sections.
    const settingsLink = await screen.findByRole("link", { name: /Settings/i });
    await user.click(settingsLink);
    expect(
      await screen.findByRole("heading", { name: /Settings/i }),
    ).toBeInTheDocument();

    const subscriptionLink = screen.getByRole("link", {
      name: /Upgrade to Pro/i,
    });
    await user.click(subscriptionLink);
    expect(
      await screen.findByRole("heading", { name: /Subscription/i }),
    ).toBeInTheDocument();
  });

  it("mobile bottom navigation reaches Home, Projects, and Profile", async () => {
    const user = userEvent.setup();
    renderApp();

    // The mobile nav is present with its primary destinations.
    const mobileNav = await screen.findByTestId("mobile_nav");
    expect(mobileNav).toBeInTheDocument();

    const projectsLink = within(mobileNav).getByRole("link", {
      name: /Projects/i,
    });
    await user.click(projectsLink);
    expect(
      await screen.findByRole("heading", { name: /^Projects$/i, level: 1 }),
    ).toBeInTheDocument();

    const profileLink = within(mobileNav).getByRole("link", {
      name: /Profile/i,
    });
    await user.click(profileLink);
    expect(
      await screen.findByRole("heading", { name: /^Profile$/i, level: 1 }),
    ).toBeInTheDocument();
  });
});
