import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Result "mo:core/Result";
import Types "../types/data-model";

module {
  // File upload limits. No provider is configured in this build, so these are
  // the only hard bounds enforced on uploads.
  let MAX_FILE_SIZE : Nat = 10_000_000; // 10 MB
  let ALLOWED_MIME_TYPES : [Text] = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "video/mp4",
    "audio/mpeg",
  ];

  // ---- Projects ----
  public func createProject(projects : Map.Map<Nat, Types.Project>, nextId : { var value : Nat }, owner : Types.UserId, name : Text) : Types.Project {
    let id = nextId.value;
    nextId.value := nextId.value + 1;
    let now = Time.now();
    let project : Types.Project = {
      id;
      owner;
      var name = name;
      var createdAt = now;
      var updatedAt = now;
    };
    projects.add(id, project);
    project
  };

  public func listProjects(projects : Map.Map<Nat, Types.Project>, owner : Types.UserId) : [Types.Project] {
    projects.values().toArray().filter(func p = p.owner == owner)
  };

  public func renameProject(projects : Map.Map<Nat, Types.Project>, owner : Types.UserId, projectId : Nat, name : Text) : ?Types.Project {
    switch (projects.get(projectId)) {
      case (?p) {
        if (p.owner != owner) {
          null
        } else {
          p.name := name;
          p.updatedAt := Time.now();
          ?p
        };
      };
      case null { null };
    };
  };

  public func deleteProject(projects : Map.Map<Nat, Types.Project>, owner : Types.UserId, projectId : Nat) : Bool {
    switch (projects.get(projectId)) {
      case (?p) {
        if (p.owner != owner) {
          false
        } else {
          projects.remove(projectId);
          true
        };
      };
      case null { false };
    };
  };

  // ---- Saved files ----
  public func validateFileUpload(upload : Types.FileUpload) : Result.Result<(), Types.FileUploadError> {
    if (upload.sizeBytes > MAX_FILE_SIZE) {
      #err(#tooLarge(upload.sizeBytes))
    } else if (not ALLOWED_MIME_TYPES.contains(upload.mimeType)) {
      #err(#unsupportedType(upload.mimeType))
    } else {
      #ok
    };
  };

  public func saveFile(files : Map.Map<Nat, Types.SavedFile>, nextId : { var value : Nat }, owner : Types.UserId, projectId : ?Nat, upload : Types.FileUpload) : Result.Result<Types.SavedFile, Types.FileUploadError> {
    switch (validateFileUpload(upload)) {
      case (#err e) { #err(e) };
      case (#ok) {
        let id = nextId.value;
        nextId.value := nextId.value + 1;
        let file : Types.SavedFile = {
          id;
          owner;
          var projectId = projectId;
          var name = upload.name;
          var mimeType = upload.mimeType;
          var sizeBytes = upload.sizeBytes;
          var createdAt = Time.now();
        };
        files.add(id, file);
        #ok(file)
      };
    };
  };

  public func listFiles(files : Map.Map<Nat, Types.SavedFile>, owner : Types.UserId) : [Types.SavedFile] {
    files.values().toArray().filter(func f = f.owner == owner)
  };

  public func deleteFile(files : Map.Map<Nat, Types.SavedFile>, owner : Types.UserId, fileId : Nat) : Bool {
    switch (files.get(fileId)) {
      case (?f) {
        if (f.owner != owner) {
          false
        } else {
          files.remove(fileId);
          true
        };
      };
      case null { false };
    };
  };

  // ---- Chat ----
  public func createConversation(conversations : Map.Map<Nat, Types.ChatConversation>, nextId : { var value : Nat }, owner : Types.UserId, title : Text) : Types.ChatConversation {
    let id = nextId.value;
    nextId.value := nextId.value + 1;
    let conversation : Types.ChatConversation = {
      id;
      owner;
      var title = title;
      var createdAt = Time.now();
    };
    conversations.add(id, conversation);
    conversation
  };

  public func listConversations(conversations : Map.Map<Nat, Types.ChatConversation>, owner : Types.UserId) : [Types.ChatConversation] {
    conversations.values().toArray().filter(func c = c.owner == owner)
  };

  public func addMessage(messages : Map.Map<Nat, Types.ChatMessage>, conversations : Map.Map<Nat, Types.ChatConversation>, nextId : { var value : Nat }, owner : Types.UserId, conversationId : Nat, role : Types.ChatRole, content : Text) : ?Types.ChatMessage {
    switch (conversations.get(conversationId)) {
      case (?c) {
        if (c.owner != owner) {
          null
        } else {
          let id = nextId.value;
          nextId.value := nextId.value + 1;
          let message : Types.ChatMessage = {
            id;
            conversationId;
            owner;
            var role = role;
            var content = content;
            var createdAt = Time.now();
          };
          messages.add(id, message);
          ?message
        };
      };
      case null { null };
    };
  };

  public func listMessages(messages : Map.Map<Nat, Types.ChatMessage>, owner : Types.UserId, conversationId : Nat) : [Types.ChatMessage] {
    messages.values().toArray().filter(func m = m.owner == owner and m.conversationId == conversationId)
  };

  public func deleteConversation(conversations : Map.Map<Nat, Types.ChatConversation>, messages : Map.Map<Nat, Types.ChatMessage>, owner : Types.UserId, conversationId : Nat) : Bool {
    switch (conversations.get(conversationId)) {
      case (?c) {
        if (c.owner != owner) {
          false
        } else {
          conversations.remove(conversationId);
          let snapshot = messages.values().toArray();
          for (m in snapshot.values()) {
            if (m.conversationId == conversationId) {
              messages.remove(m.id);
            };
          };
          true
        };
      };
      case null { false };
    };
  };

  // ---- User settings ----
  public func getUserSettings(settings : Map.Map<Principal, Types.UserSettings>, owner : Types.UserId) : ?Types.UserSettings {
    settings.get(owner)
  };

  public func updateUserSettings(settings : Map.Map<Principal, Types.UserSettings>, owner : Types.UserId, theme : Text, notificationsEnabled : Bool, displayName : Text, email : ?Text, language : Text) : Types.UserSettings {
    let updated : Types.UserSettings = {
      owner;
      var theme = theme;
      var notificationsEnabled = notificationsEnabled;
      var displayName = displayName;
      var email = email;
      var language = language;
    };
    settings.add(owner, updated);
    updated
  };

  // ---- Subscription ----
  public func getSubscription(subscriptions : Map.Map<Principal, Types.SubscriptionStatus>, owner : Types.UserId) : ?Types.SubscriptionStatus {
    subscriptions.get(owner)
  };

  public func updateSubscription(subscriptions : Map.Map<Principal, Types.SubscriptionStatus>, owner : Types.UserId, tier : Types.SubscriptionTier, expiresAt : ?Types.Timestamp) : Types.SubscriptionStatus {
    let updated : Types.SubscriptionStatus = {
      owner;
      var tier = tier;
      var expiresAt = expiresAt;
    };
    subscriptions.add(owner, updated);
    updated
  };

  // ---- AI provider service interfaces ----
  // No AI provider is configured in this build. These interfaces exist so the
  // frontend can connect a provider later without rebuilding; until then they
  // return a clear "not configured" result and never fabricate output.
  public func chat(owner : Types.UserId, conversationId : Nat, message : Text) : Types.ChatResult {
    ignore (owner, conversationId, message);
    #providerNotConfigured
  };

  public func listGenerations(generations : Map.Map<Nat, Types.Generation>, owner : Types.UserId) : [Types.Generation] {
    generations.values().toArray().filter(func g = g.owner == owner)
  };

  public func generateImage(generations : Map.Map<Nat, Types.Generation>, nextId : { var value : Nat }, owner : Types.UserId, projectId : Nat, prompt : Text) : Types.ImageGenerationResult {
    // No provider is configured, so no generation is produced or persisted.
    // When a provider is connected, a Generation record is created here and
    // becomes visible through listGenerations. Until then we never fabricate.
    ignore (generations, nextId, owner, projectId, prompt);
    #providerNotConfigured
  };
};
