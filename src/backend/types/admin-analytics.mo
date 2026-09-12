import DataModelTypes "../types/data-model";

module {
  public type UserId = Principal;
  public type Timestamp = Int;

  // ---- User registry / activity ----
  public type AccountStatus = {
    #active;
    #disabled;
  };

  public type UserRecord = {
    id : UserId;
    var email : ?Text;
    var displayName : Text;
    var registeredAt : Timestamp;
    var lastActiveAt : Timestamp;
    var accountStatus : AccountStatus;
  };

  // ---- Analytics events ----
  public type AnalyticsEventType = {
    #registration;
    #login;
    #generationStarted;
    #generationCompleted;
    #generationFailed;
    #subscriptionStarted;
    #subscriptionRenewed;
    #subscriptionCancelled;
    #paymentCompleted;
  };

  public type AnalyticsEvent = {
    id : Nat;
    user : UserId;
    var eventType : AnalyticsEventType;
    var timestamp : Timestamp;
    var metadata : ?Text;
  };

  public type AnalyticsEventView = {
    id : Nat;
    user : UserId;
    eventType : AnalyticsEventType;
    timestamp : Timestamp;
    metadata : ?Text;
  };

  // ---- Admin settings ----
  public type AdminSettings = {
    var otherCosts : Nat;
  };

  public type AdminSettingsView = {
    otherCosts : Nat;
  };

  // ---- Connection status ----
  public type ConnectionStatus = {
    #connected;
    #notConnected;
  };

  // ---- Revenue / profit ----
  public type RevenueSummary = {
    status : ConnectionStatus;
    today : Nat;
    thisWeek : Nat;
    thisMonth : Nat;
    total : Nat;
    subscription : Nat;
    oneTime : Nat;
    advertisement : Nat;
  };

  public type ProfitSummary = {
    status : ConnectionStatus;
    totalRevenue : Nat;
    aiApiCost : Nat;
    otherCosts : Nat;
    estimatedProfit : Nat;
    profitMargin : ?Float;
  };

  // ---- Dashboard overview ----
  public type DashboardOverview = {
    totalUsers : Nat;
    activeUsersToday : Nat;
    activeUsersThisMonth : Nat;
    newUsersToday : Nat;
    totalGenerations : Nat;
    premiumUsers : Nat;
    totalRevenue : RevenueSummary;
    estimatedProfit : ProfitSummary;
  };

  // ---- User metrics ----
  public type UserMetrics = {
    totalRegistered : Nat;
    newToday : Nat;
    newThisWeek : Nat;
    newThisMonth : Nat;
    dailyActive : Nat;
    monthlyActive : Nat;
    returningUsers : Nat;
    retentionRate : ?Float;
  };

  // ---- Chart series ----
  public type ChartRange = {
    #last7Days;
    #last30Days;
    #last90Days;
  };

  public type ChartPoint = {
    date : Timestamp;
    newUsers : Nat;
    activeUsers : Nat;
    retentionRate : ?Float;
  };

  public type ChartSeries = {
    range : ChartRange;
    points : [ChartPoint];
  };

  // ---- Per-feature AI usage ----
  public type FeatureUsage = {
    tool : Text;
    totalGenerations : Nat;
    successfulGenerations : Nat;
    failedGenerations : Nat;
    numberOfUsers : Nat;
    averageGenerationsPerUser : ?Float;
  };

  // ---- Subscription metrics ----
  public type SubscriptionMetrics = {
    freeUsers : Nat;
    premiumUsers : Nat;
    activeSubscriptions : Nat;
    newSubscriptions : Nat;
    cancelledSubscriptions : Nat;
    renewals : Nat;
    subscriptionRevenue : RevenueSummary;
  };

  // ---- User list / management ----
  public type AdminUserRow = {
    id : UserId;
    name : Text;
    email : ?Text;
    registeredAt : Timestamp;
    lastActiveAt : Timestamp;
    aiGenerations : Nat;
    subscriptionStatus : DataModelTypes.SubscriptionStatusView;
    totalAmountSpent : Nat;
    accountStatus : AccountStatus;
  };

  public type UserDetail = {
    user : AdminUserRow;
    metrics : UserMetrics;
    featureUsage : [FeatureUsage];
    recentEvents : [AnalyticsEventView];
  };

  // ---- Date filter ----
  public type DateRange = {
    #today;
    #last7Days;
    #last30Days;
    #last90Days;
    #custom : { from : Timestamp; to : Timestamp };
  };

  // ---- CSV export ----
  public type CsvExport = {
    filename : Text;
    content : Text;
  };
};
