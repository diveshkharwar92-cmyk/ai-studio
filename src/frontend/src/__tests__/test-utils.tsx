import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";

import App from "@/App";

export interface MockActor {
  listProjects: ReturnType<typeof vi.fn>;
  listFiles: ReturnType<typeof vi.fn>;
  listConversations: ReturnType<typeof vi.fn>;
  listMessages: ReturnType<typeof vi.fn>;
  listGenerations: ReturnType<typeof vi.fn>;
  createConversation: ReturnType<typeof vi.fn>;
  deleteConversation: ReturnType<typeof vi.fn>;
  addMessage: ReturnType<typeof vi.fn>;
  chat: ReturnType<typeof vi.fn>;
  generateImage: ReturnType<typeof vi.fn>;
  saveFile: ReturnType<typeof vi.fn>;
  getUserSettings: ReturnType<typeof vi.fn>;
  updateUserSettings: ReturnType<typeof vi.fn>;
  getSubscription: ReturnType<typeof vi.fn>;
  createProject: ReturnType<typeof vi.fn>;
  renameProject: ReturnType<typeof vi.fn>;
  deleteProject: ReturnType<typeof vi.fn>;
  getCallerUserRole: ReturnType<typeof vi.fn>;
  isCallerAdmin: ReturnType<typeof vi.fn>;
}

export function createMockActor(): MockActor {
  return {
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
  };
}

export function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
  return { ...utils, queryClient };
}
