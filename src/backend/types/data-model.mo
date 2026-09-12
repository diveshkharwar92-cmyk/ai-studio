module {
  public type UserId = Principal;
  public type Timestamp = Int;

  // ---- Users ----
  public type User = {
    id : UserId;
    var username : Text;
    var email : ?Text;
    var createdAt : Timestamp;
  };

  // ---- Projects ----
  public type Project = {
    id : Nat;
    owner : UserId;
    var name : Text;
    var createdAt : Timestamp;
    var updatedAt : Timestamp;
  };

  // ---- Generations ----
  public type GenerationStatus = {
    #pending;
    #completed;
    #failed;
  };

  public type Generation = {
    id : Nat;
    projectId : Nat;
    owner : UserId;
    var tool : Text;
    var status : GenerationStatus;
    var createdAt : Timestamp;
  };

  // ---- Chat ----
  public type ChatRole = {
    #user;
    #assistant;
  };

  public type ChatConversation = {
    id : Nat;
    owner : UserId;
    var title : Text;
    var createdAt : Timestamp;
  };

  public type ChatMessage = {
    id : Nat;
    conversationId : Nat;
    owner : UserId;
    var role : ChatRole;
    var content : Text;
    var createdAt : Timestamp;
  };

  // ---- Saved files ----
  public type SavedFile = {
    id : Nat;
    owner : UserId;
    var projectId : ?Nat;
    var name : Text;
    var mimeType : Text;
    var sizeBytes : Nat;
    var createdAt : Timestamp;
  };

  // ---- User settings ----
  public type UserSettings = {
    owner : UserId;
    var theme : Text;
    var notificationsEnabled : Bool;
    var displayName : Text;
    var email : ?Text;
    var language : Text;
  };

  // ---- Subscription ----
  public type SubscriptionTier = {
    #free;
    #pro;
  };

  public type SubscriptionStatus = {
    owner : UserId;
    var tier : SubscriptionTier;
    var expiresAt : ?Timestamp;
  };

  // ---- AI provider service interfaces ----
  public type ProviderStatus = {
    #configured;
    #notConfigured;
  };

  public type ChatResult = {
    #ok : { message : Text };
    #providerNotConfigured;
  };

  public type ImageGenerationResult = {
    #ok : { generationId : Nat };
    #providerNotConfigured;
  };

  // ---- File upload validation ----
  public type FileUpload = {
    name : Text;
    mimeType : Text;
    sizeBytes : Nat;
  };

  public type FileUploadError = {
    #tooLarge : Nat;
    #unsupportedType : Text;
    #notAuthorized;
  };

  // ---- Shared (immutable) public views ----
  // The internal records above carry `var` fields and are therefore not shared,
  // so they cannot cross the public API boundary. These immutable views are the
  // serializable shapes the public endpoints return.
  public type ProjectView = {
    id : Nat;
    owner : UserId;
    name : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type SavedFileView = {
    id : Nat;
    owner : UserId;
    projectId : ?Nat;
    name : Text;
    mimeType : Text;
    sizeBytes : Nat;
    createdAt : Timestamp;
  };

  public type ChatConversationView = {
    id : Nat;
    owner : UserId;
    title : Text;
    createdAt : Timestamp;
  };

  public type ChatMessageView = {
    id : Nat;
    conversationId : Nat;
    owner : UserId;
    role : ChatRole;
    content : Text;
    createdAt : Timestamp;
  };

  public type UserSettingsView = {
    owner : UserId;
    theme : Text;
    notificationsEnabled : Bool;
    displayName : Text;
    email : ?Text;
    language : Text;
  };

  public type SubscriptionStatusView = {
    owner : UserId;
    tier : SubscriptionTier;
    expiresAt : ?Timestamp;
  };

  public type GenerationView = {
    id : Nat;
    projectId : Nat;
    owner : UserId;
    tool : Text;
    status : GenerationStatus;
    createdAt : Timestamp;
  };
};
