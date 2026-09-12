import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type UserId = Principal;
  type Timestamp = Int;

  type Project = {
    id : Nat;
    owner : UserId;
    var name : Text;
    var createdAt : Timestamp;
    var updatedAt : Timestamp;
  };

  type SavedFile = {
    id : Nat;
    owner : UserId;
    var projectId : ?Nat;
    var name : Text;
    var mimeType : Text;
    var sizeBytes : Nat;
    var createdAt : Timestamp;
  };

  type ChatConversation = {
    id : Nat;
    owner : UserId;
    var title : Text;
    var createdAt : Timestamp;
  };

  type ChatMessage = {
    id : Nat;
    conversationId : Nat;
    owner : UserId;
    var role : { #user; #assistant };
    var content : Text;
    var createdAt : Timestamp;
  };

  type UserSettings = {
    owner : UserId;
    var theme : Text;
    var notificationsEnabled : Bool;
    var displayName : Text;
    var email : ?Text;
    var language : Text;
  };

  type SubscriptionStatus = {
    owner : UserId;
    var tier : { #free; #pro };
    var expiresAt : ?Timestamp;
  };

  type GenerationStatus = { #pending; #completed; #failed };

  type Generation = {
    id : Nat;
    projectId : Nat;
    owner : UserId;
    var tool : Text;
    var status : GenerationStatus;
    var createdAt : Timestamp;
  };

  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    projects : Map.Map<Nat, Project>;
    files : Map.Map<Nat, SavedFile>;
    conversations : Map.Map<Nat, ChatConversation>;
    messages : Map.Map<Nat, ChatMessage>;
    settings : Map.Map<Principal, UserSettings>;
    subscriptions : Map.Map<Principal, SubscriptionStatus>;
    generations : Map.Map<Nat, Generation>;
    nextId : { var value : Nat };
  };

  public func migration(_old : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      projects = Map.empty();
      files = Map.empty();
      conversations = Map.empty();
      messages = Map.empty();
      settings = Map.empty();
      subscriptions = Map.empty();
      generations = Map.empty();
      nextId = { var value = 0 };
    };
  };
};
