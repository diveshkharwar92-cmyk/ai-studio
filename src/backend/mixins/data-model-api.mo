import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/data-model";
import AdminAnalyticsTypes "../types/admin-analytics";
import DataModelLib "../lib/data-model";
import AdminAnalyticsLib "../lib/admin-analytics";

mixin (
  accessControlState : AccessControl.AccessControlState,
  projects : Map.Map<Nat, Types.Project>,
  files : Map.Map<Nat, Types.SavedFile>,
  conversations : Map.Map<Nat, Types.ChatConversation>,
  messages : Map.Map<Nat, Types.ChatMessage>,
  settings : Map.Map<Principal, Types.UserSettings>,
  subscriptions : Map.Map<Principal, Types.SubscriptionStatus>,
  generations : Map.Map<Nat, Types.Generation>,
  nextId : { var value : Nat },
  users : Map.Map<Principal, AdminAnalyticsTypes.UserRecord>,
  events : Map.Map<Nat, AdminAnalyticsTypes.AnalyticsEvent>,
  nextEventId : { var value : Nat },
) {
  // Non-trapping authorization check. True only for a signed-in caller holding
  // the #user or #admin role. Anonymous and unregistered callers get false so
  // the public methods below answer gracefully instead of trapping. This
  // inspects the access-control state directly because AccessControl.hasPermission
  // traps for a signed-in but unregistered caller.
  func isAuthorized(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case (null) { false };
      case (?role) { role == #user or role == #admin };
    };
  };

  // ---- Shared view conversions ----
  func toProjectView(p : Types.Project) : Types.ProjectView {
    { id = p.id; owner = p.owner; name = p.name; createdAt = p.createdAt; updatedAt = p.updatedAt }
  };

  func toSavedFileView(f : Types.SavedFile) : Types.SavedFileView {
    { id = f.id; owner = f.owner; projectId = f.projectId; name = f.name; mimeType = f.mimeType; sizeBytes = f.sizeBytes; createdAt = f.createdAt }
  };

  func toChatConversationView(c : Types.ChatConversation) : Types.ChatConversationView {
    { id = c.id; owner = c.owner; title = c.title; createdAt = c.createdAt }
  };

  func toChatMessageView(m : Types.ChatMessage) : Types.ChatMessageView {
    { id = m.id; conversationId = m.conversationId; owner = m.owner; role = m.role; content = m.content; createdAt = m.createdAt }
  };

  func toUserSettingsView(s : Types.UserSettings) : Types.UserSettingsView {
    { owner = s.owner; theme = s.theme; notificationsEnabled = s.notificationsEnabled; displayName = s.displayName; email = s.email; language = s.language }
  };

  func toSubscriptionStatusView(s : Types.SubscriptionStatus) : Types.SubscriptionStatusView {
    { owner = s.owner; tier = s.tier; expiresAt = s.expiresAt }
  };

  func toGenerationView(g : Types.Generation) : Types.GenerationView {
    { id = g.id; projectId = g.projectId; owner = g.owner; tool = g.tool; status = g.status; createdAt = g.createdAt }
  };

  // ---- Empty views returned when the caller is not authorized ----
  func emptyProjectView(caller : Principal) : Types.ProjectView {
    { id = 0; owner = caller; name = ""; createdAt = 0; updatedAt = 0 }
  };

  func emptyChatConversationView(caller : Principal) : Types.ChatConversationView {
    { id = 0; owner = caller; title = ""; createdAt = 0 }
  };

  func emptyUserSettingsView(caller : Principal) : Types.UserSettingsView {
    { owner = caller; theme = ""; notificationsEnabled = false; displayName = ""; email = null; language = "" }
  };

  func emptySubscriptionStatusView(caller : Principal) : Types.SubscriptionStatusView {
    { owner = caller; tier = #free; expiresAt = null }
  };

  // ---- Projects ----
  public shared ({ caller }) func createProject(name : Text) : async Types.ProjectView {
    if (not isAuthorized(caller)) { return emptyProjectView(caller) };
    AdminAnalyticsLib.touchUserActivity(users, caller);
    toProjectView(DataModelLib.createProject(projects, nextId, caller, name))
  };

  public shared query ({ caller }) func listProjects() : async [Types.ProjectView] {
    if (not isAuthorized(caller)) { return [] };
    DataModelLib.listProjects(projects, caller).map(toProjectView)
  };

  public shared ({ caller }) func renameProject(projectId : Nat, name : Text) : async ?Types.ProjectView {
    if (not isAuthorized(caller)) { return null };
    switch (DataModelLib.renameProject(projects, caller, projectId, name)) {
      case (?p) { ?toProjectView(p) };
      case null { null };
    };
  };

  public shared ({ caller }) func deleteProject(projectId : Nat) : async Bool {
    if (not isAuthorized(caller)) { return false };
    DataModelLib.deleteProject(projects, caller, projectId)
  };

  // ---- Saved files ----
  public shared ({ caller }) func saveFile(projectId : ?Nat, upload : Types.FileUpload) : async Result.Result<Types.SavedFileView, Types.FileUploadError> {
    if (not isAuthorized(caller)) { return #err(#notAuthorized) };
    AdminAnalyticsLib.touchUserActivity(users, caller);
    switch (DataModelLib.saveFile(files, nextId, caller, projectId, upload)) {
      case (#ok f) { #ok(toSavedFileView(f)) };
      case (#err e) { #err(e) };
    };
  };

  public shared query ({ caller }) func listFiles() : async [Types.SavedFileView] {
    if (not isAuthorized(caller)) { return [] };
    DataModelLib.listFiles(files, caller).map(toSavedFileView)
  };

  public shared ({ caller }) func deleteFile(fileId : Nat) : async Bool {
    if (not isAuthorized(caller)) { return false };
    DataModelLib.deleteFile(files, caller, fileId)
  };

  // ---- Chat ----
  public shared ({ caller }) func createConversation(title : Text) : async Types.ChatConversationView {
    if (not isAuthorized(caller)) { return emptyChatConversationView(caller) };
    AdminAnalyticsLib.touchUserActivity(users, caller);
    toChatConversationView(DataModelLib.createConversation(conversations, nextId, caller, title))
  };

  public shared query ({ caller }) func listConversations() : async [Types.ChatConversationView] {
    if (not isAuthorized(caller)) { return [] };
    DataModelLib.listConversations(conversations, caller).map(toChatConversationView)
  };

  public shared ({ caller }) func addMessage(conversationId : Nat, content : Text) : async ?Types.ChatMessageView {
    if (not isAuthorized(caller)) { return null };
    AdminAnalyticsLib.touchUserActivity(users, caller);
    switch (DataModelLib.addMessage(messages, conversations, nextId, caller, conversationId, #user, content)) {
      case (?m) { ?toChatMessageView(m) };
      case null { null };
    };
  };

  public shared query ({ caller }) func listMessages(conversationId : Nat) : async [Types.ChatMessageView] {
    if (not isAuthorized(caller)) { return [] };
    DataModelLib.listMessages(messages, caller, conversationId).map(toChatMessageView)
  };

  public shared ({ caller }) func deleteConversation(conversationId : Nat) : async Bool {
    if (not isAuthorized(caller)) { return false };
    DataModelLib.deleteConversation(conversations, messages, caller, conversationId)
  };

  // ---- User settings ----
  public shared query ({ caller }) func getUserSettings() : async ?Types.UserSettingsView {
    if (not isAuthorized(caller)) { return null };
    switch (DataModelLib.getUserSettings(settings, caller)) {
      case (?s) { ?toUserSettingsView(s) };
      case null { null };
    };
  };

  public shared ({ caller }) func updateUserSettings(theme : Text, notificationsEnabled : Bool, displayName : Text, email : ?Text, language : Text) : async Types.UserSettingsView {
    if (not isAuthorized(caller)) { return emptyUserSettingsView(caller) };
    AdminAnalyticsLib.touchUserActivity(users, caller);
    toUserSettingsView(DataModelLib.updateUserSettings(settings, caller, theme, notificationsEnabled, displayName, email, language))
  };

  // ---- Subscription ----
  public shared query ({ caller }) func getSubscription() : async ?Types.SubscriptionStatusView {
    if (not isAuthorized(caller)) { return null };
    switch (DataModelLib.getSubscription(subscriptions, caller)) {
      case (?s) { ?toSubscriptionStatusView(s) };
      case null { null };
    };
  };

  public shared ({ caller }) func updateSubscription(tier : Types.SubscriptionTier, expiresAt : ?Types.Timestamp) : async Types.SubscriptionStatusView {
    if (not isAuthorized(caller)) { return emptySubscriptionStatusView(caller) };
    let prevTier = switch (subscriptions.get(caller)) {
      case (?s) { s.tier };
      case null { #free };
    };
    let result = toSubscriptionStatusView(DataModelLib.updateSubscription(subscriptions, caller, tier, expiresAt));
    if (prevTier == #free and tier == #pro) {
      ignore AdminAnalyticsLib.recordEvent(events, nextEventId, caller, #subscriptionStarted, null);
    } else if (prevTier == #pro and tier == #pro) {
      ignore AdminAnalyticsLib.recordEvent(events, nextEventId, caller, #subscriptionRenewed, null);
    } else if (prevTier == #pro and tier == #free) {
      ignore AdminAnalyticsLib.recordEvent(events, nextEventId, caller, #subscriptionCancelled, null);
    };
    AdminAnalyticsLib.touchUserActivity(users, caller);
    result;
  };

  // ---- AI provider service interfaces ----
  public shared ({ caller }) func chat(conversationId : Nat, message : Text) : async Types.ChatResult {
    if (not isAuthorized(caller)) { return #providerNotConfigured };
    AdminAnalyticsLib.touchUserActivity(users, caller);
    DataModelLib.chat(caller, conversationId, message)
  };

  public shared query ({ caller }) func listGenerations() : async [Types.GenerationView] {
    if (not isAuthorized(caller)) { return [] };
    DataModelLib.listGenerations(generations, caller).map(toGenerationView)
  };

  public shared ({ caller }) func generateImage(projectId : Nat, prompt : Text) : async Types.ImageGenerationResult {
    if (not isAuthorized(caller)) { return #providerNotConfigured };
    AdminAnalyticsLib.touchUserActivity(users, caller);
    DataModelLib.generateImage(generations, nextId, caller, projectId, prompt)
  };
};
