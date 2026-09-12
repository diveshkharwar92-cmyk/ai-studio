import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/theme-provider";
import { SettingsPage } from "@/pages/SettingsPage";

const { mockActor } = vi.hoisted(() => ({
  mockActor: {
    getUserSettings: vi.fn().mockResolvedValue(null),
    updateUserSettings: vi.fn().mockResolvedValue({
      theme: "dark",
      notificationsEnabled: true,
      displayName: "",
      email: null,
      language: "English",
    }),
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

function renderSettings() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <SettingsPage />
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

describe("SettingsPage", () => {
  it("renders Profile, Theme, Language, Notifications, Privacy, and Account sections", async () => {
    renderSettings();

    expect(await screen.findByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("Privacy")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("offers Light, Dark, and System theme options and persists the choice", async () => {
    const user = userEvent.setup();
    renderSettings();

    const light = await screen.findByRole("button", { name: /Light/i });
    const dark = screen.getByRole("button", { name: /Dark/i });
    const system = screen.getByRole("button", { name: /System/i });

    expect(light).toBeInTheDocument();
    expect(dark).toBeInTheDocument();
    expect(system).toBeInTheDocument();

    // Selecting Light persists the theme through the backend.
    await user.click(light);
    await waitFor(() => {
      expect(mockActor.updateUserSettings).toHaveBeenCalledWith(
        "light",
        true,
        "",
        null,
        "English",
      );
    });
  });
});
