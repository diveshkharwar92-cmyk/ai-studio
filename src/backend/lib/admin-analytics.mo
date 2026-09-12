import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Types "../types/admin-analytics";
import DataModelTypes "../types/data-model";

module {
  // Nanoseconds in one day.
  let DAY_NS : Int = 86_400_000_000_000;

  func now() : Int = Time.now();

  func startOfDay(ts : Int) : Int {
    ts - (ts % DAY_NS)
  };

  // ---- User registry / activity ----
  public func recordUserRegistration(users : Map.Map<Principal, Types.UserRecord>, caller : Principal, email : ?Text, displayName : Text) : Types.UserRecord {
    let t = now();
    switch (users.get(caller)) {
      case (?existing) {
        existing.email := email;
        existing.displayName := displayName;
        existing.lastActiveAt := t;
        existing;
      };
      case null {
        let rec : Types.UserRecord = {
          id = caller;
          var email = email;
          var displayName = displayName;
          var registeredAt = t;
          var lastActiveAt = t;
          var accountStatus = #active;
        };
        users.add(caller, rec);
        rec;
      };
    };
  };

  public func touchUserActivity(users : Map.Map<Principal, Types.UserRecord>, caller : Principal) : () {
    switch (users.get(caller)) {
      case (?u) { u.lastActiveAt := now() };
      case null {};
    };
  };

  // ---- Analytics events ----
  public func recordEvent(events : Map.Map<Nat, Types.AnalyticsEvent>, nextEventId : { var value : Nat }, user : Principal, eventType : Types.AnalyticsEventType, metadata : ?Text) : Types.AnalyticsEvent {
    let id = nextEventId.value;
    nextEventId.value := nextEventId.value + 1;
    let ev : Types.AnalyticsEvent = {
      id;
      user;
      var eventType = eventType;
      var timestamp = now();
      var metadata = metadata;
    };
    events.add(id, ev);
    ev;
  };

  // ---- Aggregates ----
  public func computeDashboardOverview(users : Map.Map<Principal, Types.UserRecord>, events : Map.Map<Nat, Types.AnalyticsEvent>, generations : Map.Map<Nat, DataModelTypes.Generation>, subscriptions : Map.Map<Principal, DataModelTypes.SubscriptionStatus>, adminSettings : Types.AdminSettings) : Types.DashboardOverview {
    ignore events;
    let t = now();
    let todayStart = startOfDay(t);
    let monthStart = t - 30 * DAY_NS;
    var activeToday = 0;
    var activeMonth = 0;
    var newToday = 0;
    for (u in users.values()) {
      if (u.lastActiveAt >= todayStart) { activeToday += 1 };
      if (u.lastActiveAt >= monthStart) { activeMonth += 1 };
      if (u.registeredAt >= todayStart) { newToday += 1 };
    };
    var premium = 0;
    for (s in subscriptions.values()) {
      if (s.tier == #pro) { premium += 1 };
    };
    {
      totalUsers = users.size();
      activeUsersToday = activeToday;
      activeUsersThisMonth = activeMonth;
      newUsersToday = newToday;
      totalGenerations = generations.size();
      premiumUsers = premium;
      totalRevenue = {
        status = #notConnected;
        today = 0;
        thisWeek = 0;
        thisMonth = 0;
        total = 0;
        subscription = 0;
        oneTime = 0;
        advertisement = 0;
      };
      estimatedProfit = {
        status = #notConnected;
        totalRevenue = 0;
        aiApiCost = 0;
        otherCosts = adminSettings.otherCosts;
        estimatedProfit = 0;
        profitMargin = null;
      };
    };
  };

  public func computeUserMetrics(users : Map.Map<Principal, Types.UserRecord>, events : Map.Map<Nat, Types.AnalyticsEvent>) : Types.UserMetrics {
    let t = now();
    let todayStart = startOfDay(t);
    let weekStart = t - 7 * DAY_NS;
    let monthStart = t - 30 * DAY_NS;
    var newToday = 0;
    var newWeek = 0;
    var newMonth = 0;
    var dailyActive = 0;
    var monthlyActive = 0;
    for (u in users.values()) {
      if (u.registeredAt >= todayStart) { newToday += 1 };
      if (u.registeredAt >= weekStart) { newWeek += 1 };
      if (u.registeredAt >= monthStart) { newMonth += 1 };
      if (u.lastActiveAt >= todayStart) { dailyActive += 1 };
      if (u.lastActiveAt >= monthStart) { monthlyActive += 1 };
    };
    // Returning users: distinct users who have signed in at least once after
    // registering (i.e. have at least one #login event).
    var returning = 0;
    let seen : Map.Map<Principal, Bool> = Map.empty();
    for (e in events.values()) {
      if (e.eventType == #login) {
        switch (seen.get(e.user)) {
          case (null) { seen.add(e.user, true); returning += 1 };
          case (?_) {};
        };
      };
    };
    let total = users.size();
    let retention : ?Float = if (total > 0) { ?(returning.toFloat() / total.toFloat()) } else { null };
    {
      totalRegistered = total;
      newToday;
      newThisWeek = newWeek;
      newThisMonth = newMonth;
      dailyActive;
      monthlyActive;
      returningUsers = returning;
      retentionRate = retention;
    };
  };

  public func computeChartSeries(users : Map.Map<Principal, Types.UserRecord>, events : Map.Map<Nat, Types.AnalyticsEvent>, range : Types.ChartRange) : Types.ChartSeries {
    ignore events;
    let days = switch (range) {
      case (#last7Days) 7;
      case (#last30Days) 30;
      case (#last90Days) 90;
    };
    let daysInt : Int = days.toInt();
    let t = now();
    let todayStart = startOfDay(t);
    var points : [Types.ChartPoint] = [];
    var i = 0;
    while (i < days) {
      let offset : Int = daysInt - 1 - i.toInt();
      let dayStart = todayStart - offset * DAY_NS;
      let dayEnd = dayStart + DAY_NS;
      var newUsers = 0;
      var activeUsers = 0;
      var registeredBefore = 0;
      for (u in users.values()) {
        if (u.registeredAt >= dayStart and u.registeredAt < dayEnd) { newUsers += 1 };
        if (u.lastActiveAt >= dayStart and u.lastActiveAt < dayEnd) { activeUsers += 1 };
        if (u.registeredAt < dayEnd) { registeredBefore += 1 };
      };
      let retention : ?Float = if (registeredBefore > 0) { ?(activeUsers.toFloat() / registeredBefore.toFloat()) } else { null };
      points := points.concat([{ date = dayStart; newUsers; activeUsers; retentionRate = retention }]);
      i += 1;
    };
    { range; points };
  };

  type ToolAgg = { var total : Nat; var success : Nat; var failed : Nat; users : Map.Map<Principal, Bool> };

  func computeFeatureUsageFromArray(gs : [DataModelTypes.Generation]) : [Types.FeatureUsage] {
    let tools : Map.Map<Text, ToolAgg> = Map.empty();
    for (g in gs.values()) {
      switch (tools.get(g.tool)) {
        case (null) {
          let entry : ToolAgg = { var total = 1; var success = 0; var failed = 0; users = Map.empty() };
          if (g.status == #completed) { entry.success := 1 };
          if (g.status == #failed) { entry.failed := 1 };
          entry.users.add(g.owner, true);
          tools.add(g.tool, entry);
        };
        case (?e) {
          e.total += 1;
          if (g.status == #completed) { e.success += 1 };
          if (g.status == #failed) { e.failed += 1 };
          e.users.add(g.owner, true);
        };
      };
    };
    tools.entries().toArray().map(func (pair : (Text, ToolAgg)) : Types.FeatureUsage {
      let (tool, e) = pair;
      let nUsers = e.users.size();
      let avg : ?Float = if (nUsers > 0) { ?(e.total.toFloat() / nUsers.toFloat()) } else { null };
      { tool; totalGenerations = e.total; successfulGenerations = e.success; failedGenerations = e.failed; numberOfUsers = nUsers; averageGenerationsPerUser = avg };
    });
  };

  public func computeFeatureUsage(generations : Map.Map<Nat, DataModelTypes.Generation>) : [Types.FeatureUsage] {
    computeFeatureUsageFromArray(generations.values().toArray());
  };

  public func computeSubscriptionMetrics(subscriptions : Map.Map<Principal, DataModelTypes.SubscriptionStatus>, events : Map.Map<Nat, Types.AnalyticsEvent>) : Types.SubscriptionMetrics {
    let t = now();
    var free = 0;
    var premium = 0;
    var active = 0;
    for (s in subscriptions.values()) {
      if (s.tier == #free) { free += 1 } else { premium += 1 };
      if (s.tier == #pro) {
        switch (s.expiresAt) {
          case (null) { active += 1 };
          case (?exp) { if (exp > t) { active += 1 } };
        };
      };
    };
    var newSubs = 0;
    var cancelled = 0;
    var renewals = 0;
    for (e in events.values()) {
      switch (e.eventType) {
        case (#subscriptionStarted) { newSubs += 1 };
        case (#subscriptionCancelled) { cancelled += 1 };
        case (#subscriptionRenewed) { renewals += 1 };
        case (_) {};
      };
    };
    {
      freeUsers = free;
      premiumUsers = premium;
      activeSubscriptions = active;
      newSubscriptions = newSubs;
      cancelledSubscriptions = cancelled;
      renewals;
      subscriptionRevenue = {
        status = #notConnected;
        today = 0;
        thisWeek = 0;
        thisMonth = 0;
        total = 0;
        subscription = 0;
        oneTime = 0;
        advertisement = 0;
      };
    };
  };

  // ---- User list / management ----
  func toAdminUserRow(u : Types.UserRecord, generations : Map.Map<Nat, DataModelTypes.Generation>, subscriptions : Map.Map<Principal, DataModelTypes.SubscriptionStatus>) : Types.AdminUserRow {
    var genCount = 0;
    for (g in generations.values()) {
      if (g.owner == u.id) { genCount += 1 };
    };
    let sub = switch (subscriptions.get(u.id)) {
      case (?s) { { owner = s.owner; tier = s.tier; expiresAt = s.expiresAt } };
      case null { { owner = u.id; tier = #free; expiresAt = null } };
    };
    {
      id = u.id;
      name = u.displayName;
      email = u.email;
      registeredAt = u.registeredAt;
      lastActiveAt = u.lastActiveAt;
      aiGenerations = genCount;
      subscriptionStatus = sub;
      totalAmountSpent = 0;
      accountStatus = u.accountStatus;
    };
  };

  func matchesSearch(r : Types.AdminUserRow, search : ?Text) : Bool {
    switch (search) {
      case (null) { true };
      case (?q) {
        let term = q.toLower();
        let nameMatch = r.name.toLower().contains(#text term);
        let emailMatch = switch (r.email) {
          case (?e) { e.toLower().contains(#text term) };
          case null { false };
        };
        nameMatch or emailMatch;
      };
    };
  };

  func matchesDateRange(ts : Types.Timestamp, dateRange : ?Types.DateRange, t : Types.Timestamp) : Bool {
    switch (dateRange) {
      case (null) { true };
      case (?r) {
        switch (r) {
          case (#today) { ts >= startOfDay(t) };
          case (#last7Days) { ts >= t - 7 * DAY_NS };
          case (#last30Days) { ts >= t - 30 * DAY_NS };
          case (#last90Days) { ts >= t - 90 * DAY_NS };
          case (#custom { from; to }) { ts >= from and ts <= to };
        };
      };
    };
  };

  public func listAdminUsers(users : Map.Map<Principal, Types.UserRecord>, generations : Map.Map<Nat, DataModelTypes.Generation>, subscriptions : Map.Map<Principal, DataModelTypes.SubscriptionStatus>, settings : Map.Map<Principal, DataModelTypes.UserSettings>, search : ?Text, dateRange : ?Types.DateRange) : [Types.AdminUserRow] {
    ignore settings;
    let t = now();
    users.values().toArray()
      .map(func u = toAdminUserRow(u, generations, subscriptions))
      .filter(func r = matchesSearch(r, search) and matchesDateRange(r.registeredAt, dateRange, t));
  };

  public func getUserDetail(users : Map.Map<Principal, Types.UserRecord>, events : Map.Map<Nat, Types.AnalyticsEvent>, generations : Map.Map<Nat, DataModelTypes.Generation>, subscriptions : Map.Map<Principal, DataModelTypes.SubscriptionStatus>, settings : Map.Map<Principal, DataModelTypes.UserSettings>, userId : Principal) : ?Types.UserDetail {
    ignore settings;
    switch (users.get(userId)) {
      case (null) { null };
      case (?u) {
        let row = toAdminUserRow(u, generations, subscriptions);
        let t = now();
        let todayStart = startOfDay(t);
        let weekStart = t - 7 * DAY_NS;
        let monthStart = t - 30 * DAY_NS;
        var hasLogin = false;
        var recent : [Types.AnalyticsEventView] = [];
        for (e in events.values()) {
          if (e.user == userId) {
            if (e.eventType == #login) { hasLogin := true };
            recent := recent.concat([{ id = e.id; user = e.user; eventType = e.eventType; timestamp = e.timestamp; metadata = e.metadata }]);
          };
        };
        recent := recent.sort(func (a, b) = Int.compare(b.timestamp, a.timestamp));
        let capped = if (recent.size() > 50) { recent.sliceToArray(0, 50) } else { recent };
        let userGens = generations.values().toArray().filter(func g = g.owner == userId);
        let featureUsage = computeFeatureUsageFromArray(userGens);
        let metrics : Types.UserMetrics = {
          totalRegistered = 1;
          newToday = if (u.registeredAt >= todayStart) { 1 } else { 0 };
          newThisWeek = if (u.registeredAt >= weekStart) { 1 } else { 0 };
          newThisMonth = if (u.registeredAt >= monthStart) { 1 } else { 0 };
          dailyActive = if (u.lastActiveAt >= todayStart) { 1 } else { 0 };
          monthlyActive = if (u.lastActiveAt >= monthStart) { 1 } else { 0 };
          returningUsers = if (hasLogin) { 1 } else { 0 };
          retentionRate = null;
        };
        ?{ user = row; metrics; featureUsage; recentEvents = capped };
      };
    };
  };

  // ---- CSV export ----
  func csvField(s : Text) : Text {
    "\"" # s # "\"";
  };

  public func exportUsersCsv(users : Map.Map<Principal, Types.UserRecord>, generations : Map.Map<Nat, DataModelTypes.Generation>, subscriptions : Map.Map<Principal, DataModelTypes.SubscriptionStatus>, settings : Map.Map<Principal, DataModelTypes.UserSettings>, search : ?Text, dateRange : ?Types.DateRange) : Types.CsvExport {
    let rows = listAdminUsers(users, generations, subscriptions, settings, search, dateRange);
    var content = "User ID,Name,Email,Registered At,Last Active,AI Generations,Subscription Tier,Total Amount Spent,Account Status\n";
    for (r in rows.values()) {
      let email = switch (r.email) { case (?e) { e }; case null { "" } };
      let tier = switch (r.subscriptionStatus.tier) { case (#free) { "free" }; case (#pro) { "pro" } };
      let status = switch (r.accountStatus) { case (#active) { "active" }; case (#disabled) { "disabled" } };
      content := content # r.id.toText() # "," # csvField(r.name) # "," # csvField(email) # "," # r.registeredAt.toText() # "," # r.lastActiveAt.toText() # "," # r.aiGenerations.toText() # "," # tier # "," # r.totalAmountSpent.toText() # "," # status # "\n";
    };
    { filename = "users.csv"; content };
  };

  public func exportAnalyticsCsv(events : Map.Map<Nat, Types.AnalyticsEvent>, dateRange : ?Types.DateRange) : Types.CsvExport {
    let t = now();
    var content = "Event ID,User,Event Type,Timestamp,Metadata\n";
    for (e in events.values()) {
      if (matchesDateRange(e.timestamp, dateRange, t)) {
        let et = switch (e.eventType) {
          case (#registration) { "registration" };
          case (#login) { "login" };
          case (#generationStarted) { "generation_started" };
          case (#generationCompleted) { "generation_completed" };
          case (#generationFailed) { "generation_failed" };
          case (#subscriptionStarted) { "subscription_started" };
          case (#subscriptionRenewed) { "subscription_renewed" };
          case (#subscriptionCancelled) { "subscription_cancelled" };
          case (#paymentCompleted) { "payment_completed" };
        };
        let meta = switch (e.metadata) { case (?m) { m }; case null { "" } };
        content := content # e.id.toText() # "," # e.user.toText() # "," # et # "," # e.timestamp.toText() # "," # csvField(meta) # "\n";
      };
    };
    { filename = "analytics.csv"; content };
  };

  // ---- Admin settings ----
  public func getAdminSettings(adminSettings : Types.AdminSettings) : Types.AdminSettingsView {
    { otherCosts = adminSettings.otherCosts };
  };

  public func updateOtherCosts(adminSettings : Types.AdminSettings, otherCosts : Nat) : Types.AdminSettingsView {
    adminSettings.otherCosts := otherCosts;
    { otherCosts = adminSettings.otherCosts };
  };
};
