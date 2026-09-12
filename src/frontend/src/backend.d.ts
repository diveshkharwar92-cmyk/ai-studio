import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type FileUploadError = {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "tooLarge";
    tooLarge: bigint;
} | {
    __kind__: "unsupportedType";
    unsupportedType: string;
};
export type Timestamp = bigint;
export interface AnalyticsEventView {
    id: bigint;
    metadata?: string;
    user: UserId;
    timestamp: Timestamp;
    eventType: AnalyticsEventType;
}
export interface AdminUserRow {
    id: UserId;
    accountStatus: AccountStatus;
    lastActiveAt: Timestamp;
    name: string;
    email?: string;
    subscriptionStatus: SubscriptionStatusView;
    aiGenerations: bigint;
    totalAmountSpent: bigint;
    registeredAt: Timestamp;
}
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result_1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface FileUpload {
    name: string;
    mimeType: string;
    sizeBytes: bigint;
}
export interface UserDetail {
    metrics: UserMetrics;
    user: AdminUserRow;
    featureUsage: Array<FeatureUsage>;
    recentEvents: Array<AnalyticsEventView>;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface FeatureUsage {
    numberOfUsers: bigint;
    failedGenerations: bigint;
    tool: string;
    totalGenerations: bigint;
    successfulGenerations: bigint;
    averageGenerationsPerUser?: number;
}
export interface ProfitSummary {
    status: ConnectionStatus;
    otherCosts: bigint;
    aiApiCost: bigint;
    totalRevenue: bigint;
    profitMargin?: number;
    estimatedProfit: bigint;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface CsvExport {
    content: string;
    filename: string;
}
export type ChatResult = {
    __kind__: "ok";
    ok: {
        message: string;
    };
} | {
    __kind__: "providerNotConfigured";
    providerNotConfigured: null;
};
export interface SubscriptionMetrics {
    premiumUsers: bigint;
    subscriptionRevenue: RevenueSummary;
    newSubscriptions: bigint;
    renewals: bigint;
    freeUsers: bigint;
    activeSubscriptions: bigint;
    cancelledSubscriptions: bigint;
}
export interface GenerationView {
    id: bigint;
    status: GenerationStatus;
    owner: UserId;
    createdAt: Timestamp;
    tool: string;
    projectId: bigint;
}
export interface ChartSeries {
    range: ChartRange;
    points: Array<ChartPoint>;
}
export interface SavedFileView {
    id: bigint;
    owner: UserId;
    name: string;
    createdAt: Timestamp;
    mimeType: string;
    projectId?: bigint;
    sizeBytes: bigint;
}
export interface ProjectView {
    id: bigint;
    owner: UserId;
    name: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface SubscriptionStatusView {
    expiresAt?: Timestamp;
    owner: UserId;
    tier: SubscriptionTier;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface RevenueSummary {
    status: ConnectionStatus;
    today: bigint;
    total: bigint;
    subscription: bigint;
    thisWeek: bigint;
    oneTime: bigint;
    thisMonth: bigint;
    advertisement: bigint;
}
export type UserId = Principal;
export type DateRange = {
    __kind__: "today";
    today: null;
} | {
    __kind__: "last90Days";
    last90Days: null;
} | {
    __kind__: "custom";
    custom: {
        to: Timestamp;
        from: Timestamp;
    };
} | {
    __kind__: "last7Days";
    last7Days: null;
} | {
    __kind__: "last30Days";
    last30Days: null;
};
export type Result = {
    __kind__: "ok";
    ok: SavedFileView;
} | {
    __kind__: "err";
    err: FileUploadError;
};
export interface ChartPoint {
    activeUsers: bigint;
    date: Timestamp;
    retentionRate?: number;
    newUsers: bigint;
}
export type ImageGenerationResult = {
    __kind__: "ok";
    ok: {
        generationId: bigint;
    };
} | {
    __kind__: "providerNotConfigured";
    providerNotConfigured: null;
};
export interface ChatMessageView {
    id: bigint;
    content: string;
    owner: UserId;
    createdAt: Timestamp;
    role: ChatRole;
    conversationId: bigint;
}
export interface AdminSettingsView {
    otherCosts: bigint;
}
export interface UserSettingsView {
    theme: string;
    notificationsEnabled: boolean;
    displayName: string;
    owner: UserId;
    email?: string;
    language: string;
}
export interface ChatConversationView {
    id: bigint;
    title: string;
    owner: UserId;
    createdAt: Timestamp;
}
export interface UserMetrics {
    newToday: bigint;
    newThisWeek: bigint;
    monthlyActive: bigint;
    newThisMonth: bigint;
    totalRegistered: bigint;
    dailyActive: bigint;
    retentionRate?: number;
    returningUsers: bigint;
}
export interface DashboardOverview {
    premiumUsers: bigint;
    newUsersToday: bigint;
    activeUsersThisMonth: bigint;
    activeUsersToday: bigint;
    totalGenerations: bigint;
    totalUsers: bigint;
    totalRevenue: RevenueSummary;
    estimatedProfit: ProfitSummary;
}
export enum AccountStatus {
    active = "active",
    disabled = "disabled"
}
export enum AnalyticsEventType {
    generationCompleted = "generationCompleted",
    subscriptionStarted = "subscriptionStarted",
    registration = "registration",
    generationStarted = "generationStarted",
    login = "login",
    subscriptionRenewed = "subscriptionRenewed",
    generationFailed = "generationFailed",
    paymentCompleted = "paymentCompleted",
    subscriptionCancelled = "subscriptionCancelled"
}
export enum ChartRange {
    last90Days = "last90Days",
    last7Days = "last7Days",
    last30Days = "last30Days"
}
export enum ChatRole {
    user = "user",
    assistant = "assistant"
}
export enum ConnectionStatus {
    notConnected = "notConnected",
    connected = "connected"
}
export enum GenerationStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum SubscriptionTier {
    pro = "pro",
    free = "free"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMessage(conversationId: bigint, content: string): Promise<ChatMessageView | null>;
    adminExportAnalyticsCsv(dateRange: DateRange | null): Promise<CsvExport>;
    adminExportUsersCsv(search: string | null, dateRange: DateRange | null): Promise<CsvExport>;
    adminGetChartSeries(range: ChartRange): Promise<ChartSeries>;
    adminGetDashboardOverview(): Promise<DashboardOverview>;
    adminGetFeatureUsage(): Promise<Array<FeatureUsage>>;
    adminGetSettings(): Promise<AdminSettingsView>;
    adminGetSubscriptionMetrics(): Promise<SubscriptionMetrics>;
    adminGetUserDetail(userId: Principal): Promise<UserDetail | null>;
    adminGetUserMetrics(): Promise<UserMetrics>;
    adminListUsers(search: string | null, dateRange: DateRange | null): Promise<Array<AdminUserRow>>;
    adminUpdateOtherCosts(otherCosts: bigint): Promise<AdminSettingsView>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    chat(conversationId: bigint, message: string): Promise<ChatResult>;
    createConversation(title: string): Promise<ChatConversationView>;
    createProject(name: string): Promise<ProjectView>;
    deleteConversation(conversationId: bigint): Promise<boolean>;
    deleteFile(fileId: bigint): Promise<boolean>;
    deleteProject(projectId: bigint): Promise<boolean>;
    execute(qJson: string): Promise<Result__1>;
    generateImage(projectId: bigint, prompt: string): Promise<ImageGenerationResult>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getSubscription(): Promise<SubscriptionStatusView | null>;
    getUserSettings(): Promise<UserSettingsView | null>;
    isCallerAdmin(): Promise<boolean>;
    listConversations(): Promise<Array<ChatConversationView>>;
    listFiles(): Promise<Array<SavedFileView>>;
    listGenerations(): Promise<Array<GenerationView>>;
    listMessages(conversationId: bigint): Promise<Array<ChatMessageView>>;
    listProjects(): Promise<Array<ProjectView>>;
    renameProject(projectId: bigint, name: string): Promise<ProjectView | null>;
    saveFile(projectId: bigint | null, upload: FileUpload): Promise<Result>;
    schema(): Promise<string>;
    updateSubscription(tier: SubscriptionTier, expiresAt: Timestamp | null): Promise<SubscriptionStatusView>;
    updateUserSettings(theme: string, notificationsEnabled: boolean, displayName: string, email: string | null, language: string): Promise<UserSettingsView>;
}
