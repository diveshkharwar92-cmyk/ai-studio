import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProfilePage } from "@/pages/ProfilePage";

const { mockIdentity } = vi.hoisted(() => ({
  mockIdentity: {
    isAuthenticated: false,
    identity: null as {
      getPrincipal: () => { toText: () => string };
    } | null,
    login: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: null, isFetching: false }),
  useInternetIdentity: () => mockIdentity,
  InternetIdentityProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

describe("ProfilePage", () => {
  it("shows the signed-out state with a sign-in button", async () => {
    mockIdentity.isAuthenticated = false;
    mockIdentity.identity = null;

    render(<ProfilePage />);

    expect(await screen.findByText("Not signed in")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign in/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Verified")).not.toBeInTheDocument();
  });

  it("shows the signed-in state with principal and sign-out", async () => {
    mockIdentity.isAuthenticated = true;
    mockIdentity.identity = {
      getPrincipal: () => ({ toText: () => "aaaaa-aa" }),
    };

    render(<ProfilePage />);

    expect(await screen.findByText("Signed in")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("aaaaa-aa")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign out/i }),
    ).toBeInTheDocument();
  });

  it("signs in when the sign-in button is clicked", async () => {
    const user = userEvent.setup();
    mockIdentity.isAuthenticated = false;
    mockIdentity.identity = null;

    render(<ProfilePage />);

    await user.click(await screen.findByRole("button", { name: /Sign in/i }));
    expect(mockIdentity.login).toHaveBeenCalled();
  });
});
