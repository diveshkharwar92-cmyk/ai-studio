import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ImagePage } from "@/pages/ImagePage";

const { mockActor } = vi.hoisted(() => ({
  mockActor: {
    listFiles: vi.fn().mockResolvedValue([]),
    generateImage: vi.fn(),
    saveFile: vi.fn(),
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

function renderImage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ImagePage />
    </QueryClientProvider>,
  );
}

describe("ImagePage", () => {
  it("shows the setup message and no gallery item when the provider is unconfigured", async () => {
    mockActor.generateImage.mockResolvedValue({
      __kind__: "providerNotConfigured",
      providerNotConfigured: null,
    });

    renderImage();

    const prompt = screen.getByPlaceholderText(/Describe the image/i);
    fireEvent.change(prompt, { target: { value: "a red apple" } });
    fireEvent.click(screen.getByRole("button", { name: /Generate/i }));

    expect(
      await screen.findByText(/AI provider is not configured yet/i),
    ).toBeInTheDocument();
    // No gallery item is fabricated.
    expect(screen.getByText(/No images yet/i)).toBeInTheDocument();
  });

  it("renders prompt, style, aspect, quality, and count options", async () => {
    renderImage();

    expect(
      screen.getByPlaceholderText(/Describe the image/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Style")).toBeInTheDocument();
    expect(screen.getByText("Aspect ratio")).toBeInTheDocument();
    expect(screen.getByText("Quality")).toBeInTheDocument();
    expect(screen.getByText("Images")).toBeInTheDocument();
  });

  it("adds a generated image to the gallery with save, delete, and share actions", async () => {
    mockActor.generateImage.mockResolvedValue({
      __kind__: "ok",
      ok: { id: 1n, url: "https://example.com/img.png" },
    });
    mockActor.saveFile.mockResolvedValue({ ok: { id: 1n } });

    renderImage();

    const prompt = screen.getByPlaceholderText(/Describe the image/i);
    fireEvent.change(prompt, { target: { value: "a red apple" } });
    fireEvent.click(screen.getByRole("button", { name: /Generate/i }));

    // The generated item appears in the gallery with its prompt.
    expect(await screen.findByText("a red apple")).toBeInTheDocument();

    // Share action is available.
    expect(
      screen.getByRole("button", { name: /Share image/i }),
    ).toBeInTheDocument();

    // Delete removes the item from the gallery.
    fireEvent.click(screen.getByRole("button", { name: /Delete image/i }));
    await waitFor(() => {
      expect(screen.getByText(/No images yet/i)).toBeInTheDocument();
    });
  });

  it("saves a generated image and marks it as saved", async () => {
    mockActor.generateImage.mockResolvedValue({
      __kind__: "ok",
      ok: { id: 1n, url: "https://example.com/img.png" },
    });
    mockActor.saveFile.mockResolvedValue({ ok: { id: 1n } });

    renderImage();

    const prompt = screen.getByPlaceholderText(/Describe the image/i);
    fireEvent.change(prompt, { target: { value: "a red apple" } });
    fireEvent.click(screen.getByRole("button", { name: /Generate/i }));

    expect(await screen.findByText("a red apple")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Save image/i }));
    await waitFor(() => {
      expect(screen.getByText("Saved")).toBeInTheDocument();
    });
  });
});
