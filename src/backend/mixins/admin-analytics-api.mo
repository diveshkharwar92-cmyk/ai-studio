import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/admin-analytics";
import DataModelTypes "../types/data-model";
import AdminAnalyticsLib "../lib/admin-analytics";

mixin (
  accessControlState : AccessControl.AccessControlState,
  users : Map.Map<Principal, Types.UserRecord>,
  events : Map.Map<Nat, Types.AnalyticsEvent>,
  nextEventId : { var value : Nat },
  adminSettings : Types.AdminSettings,
  generations : Map.Map<Nat, DataModelTypes.Generation>,
  subscriptions : Map.Map<Principal, DataModelTypes.SubscriptionStatus>,
  settings : Map.Map<Principal, DataModelTypes.UserSettings>,
) {
  // Non-trapping admin check. True only for a signed-in caller holding the
  // #admin role. Anonymous and unregistered callers get false so the guard
  // below can reject them cleanly instead of trapping on a missing role.
  func isAdmin(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case (null) { false };
      case (?role) { role == #admin };
    };
  };

  // Every admin endpoint MUST validate the caller's admin role server-side.
  func requireAdmin(caller : Principal) {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  // ---- Dashboard ----
  public shared query ({ caller }) func adminGetDashboardOverview() : async Types.DashboardOverview {
    requireAdmin(caller);
    AdminAnalyticsLib.computeDashboardOverview(users, events, generations, subscriptions, adminSettings);
  };

  public shared query ({ caller }) func adminGetUserMetrics() : async Types.UserMetrics {
    requireAdmin(caller);
    AdminAnalyticsLib.computeUserMetrics(users, events);
  };

  public shared query ({ caller }) func adminGetChartSeries(range : Types.ChartRange) : async Types.ChartSeries {
    requireAdmin(caller);
    AdminAnalyticsLib.computeChartSeries(users, events, range);
  };

  public shared query ({ caller }) func adminGetFeatureUsage() : async [Types.FeatureUsage] {
    requireAdmin(caller);
    AdminAnalyticsLib.computeFeatureUsage(generations);
  };

  public shared query ({ caller }) func adminGetSubscriptionMetrics() : async Types.SubscriptionMetrics {
    requireAdmin(caller);
    AdminAnalyticsLib.computeSubscriptionMetrics(subscriptions, events);
  };

  // ---- User management ----
  public shared query ({ caller }) func adminListUsers(search : ?Text, dateRange : ?Types.DateRange) : async [Types.AdminUserRow] {
    requireAdmin(caller);
    AdminAnalyticsLib.listAdminUsers(users, generations, subscriptions, settings, search, dateRange);
  };

  public shared query ({ caller }) func adminGetUserDetail(userId : Principal) : async ?Types.UserDetail {
    requireAdmin(caller);
    AdminAnalyticsLib.getUserDetail(users, events, generations, subscriptions, settings, userId);
  };

  // ---- CSV export ----
  public shared query ({ caller }) func adminExportUsersCsv(search : ?Text, dateRange : ?Types.DateRange) : async Types.CsvExport {
    requireAdmin(caller);
    AdminAnalyticsLib.exportUsersCsv(users, generations, subscriptions, settings, search, dateRange);
  };

  public shared query ({ caller }) func adminExportAnalyticsCsv(dateRange : ?Types.DateRange) : async Types.CsvExport {
    requireAdmin(caller);
    AdminAnalyticsLib.exportAnalyticsCsv(events, dateRange);
  };

  // ---- Admin settings ----
  public shared query ({ caller }) func adminGetSettings() : async Types.AdminSettingsView {
    requireAdmin(caller);
    AdminAnalyticsLib.getAdminSettings(adminSettings);
  };

  public shared ({ caller }) func adminUpdateOtherCosts(otherCosts : Nat) : async Types.AdminSettingsView {
    requireAdmin(caller);
    AdminAnalyticsLib.updateOtherCosts(adminSettings, otherCosts);
  };
};
