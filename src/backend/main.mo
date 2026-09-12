import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Verify "mo:identity-attributes/Internal/Verify";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import IntValue "mo:caffeineai-oql/IntValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "types/data-model";
import AdminAnalyticsTypes "types/admin-analytics";
import DataModelApi "mixins/data-model-api";
import AdminAnalyticsApi "mixins/admin-analytics-api";
import ApiDocMixin "mixins/api-doc";
import AdminAnalyticsLib "lib/admin-analytics";
import OptNatValue "lib/OptNatValue";
import OptTimestampValue "lib/OptTimestampValue";
import OptTextValue "lib/OptTextValue";
import ChatRoleValue "lib/ChatRoleValue";
import SubscriptionTierValue "lib/SubscriptionTierValue";
import GenerationStatusValue "lib/GenerationStatusValue";
import AccountStatusValue "lib/AccountStatusValue";
import AnalyticsEventTypeValue "lib/AnalyticsEventTypeValue";

actor {
  let accessControlState : AccessControl.AccessControlState;

  let projects : Map.Map<Nat, Types.Project>;
  let files : Map.Map<Nat, Types.SavedFile>;
  let conversations : Map.Map<Nat, Types.ChatConversation>;
  let messages : Map.Map<Nat, Types.ChatMessage>;
  let settings : Map.Map<Principal, Types.UserSettings>;
  let subscriptions : Map.Map<Principal, Types.SubscriptionStatus>;
  let generations : Map.Map<Nat, Types.Generation>;
  let nextId : { var value : Nat };

  let users : Map.Map<Principal, AdminAnalyticsTypes.UserRecord>;
  let events : Map.Map<Nat, AdminAnalyticsTypes.AnalyticsEvent>;
  let nextEventId : { var value : Nat };
  let adminSettings : AdminAnalyticsTypes.AdminSettings;

  transient let anyP = Principal.fromText("aaaaa-aa");

  // Records real user activity on sign-in: registers a first-time caller and
  // records registration + login analytics events. Wired into the Internet
  // Identity sign-in flow via the onAttributesVerified callback.
  func onSignIn(caller : Principal, attrs : Verify.IdentityAttributes) {
    let isNew = switch (users.get(caller)) {
      case (null) { true };
      case (?_) { false };
    };
    let email = attrs.email;
    let name = attrs.name ?? caller.toText();
    ignore AdminAnalyticsLib.recordUserRegistration(users, caller, email, name);
    if (isNew) {
      ignore AdminAnalyticsLib.recordEvent(events, nextEventId, caller, #registration, null);
    };
    ignore AdminAnalyticsLib.recordEvent(events, nextEventId, caller, #login, null);
  };

  include MixinAuthorization(accessControlState, ?onSignIn);
  include DataModelApi(accessControlState, projects, files, conversations, messages, settings, subscriptions, generations, nextId, users, events, nextEventId);
  include AdminAnalyticsApi(accessControlState, users, events, nextEventId, adminSettings, generations, subscriptions, settings);
  include Expose({
    entities = [
      projects.toEntity("project", "Project", "id")
        .sample({ id = 0; owner = anyP; var name = ""; var createdAt = 0 : Int; var updatedAt = 0 : Int })
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
      files.toEntity("savedFile", "SavedFile", "id")
        .sample({ id = 0; owner = anyP; var projectId = null : ?Nat; var name = ""; var mimeType = ""; var sizeBytes = 0; var createdAt = 0 : Int })
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
      conversations.toEntity("conversation", "ChatConversation", "id")
        .sample({ id = 0; owner = anyP; var title = ""; var createdAt = 0 : Int })
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
      messages.toEntity("message", "ChatMessage", "id")
        .sample({ id = 0; conversationId = 0; owner = anyP; var role = #user : Types.ChatRole; var content = ""; var createdAt = 0 : Int })
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
      settings.toEntity("userSetting", "UserSettings", "owner")
        .sample({ owner = anyP; var theme = ""; var notificationsEnabled = false; var displayName = ""; var email = null : ?Text; var language = "" })
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
      subscriptions.toEntity("subscription", "SubscriptionStatus", "owner")
        .sample({ owner = anyP; var tier = #free : Types.SubscriptionTier; var expiresAt = null : ?Types.Timestamp })
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
      generations.toEntity("generation", "Generation", "id")
        .sample({ id = 0; projectId = 0; owner = anyP; var tool = ""; var status = #pending : Types.GenerationStatus; var createdAt = 0 : Int })
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
      users.toEntity("userRecord", "UserRecord", "id")
        .sample({ id = anyP; var email = null : ?Text; var displayName = ""; var registeredAt = 0 : Int; var lastActiveAt = 0 : Int; var accountStatus = #active : AdminAnalyticsTypes.AccountStatus })
        .controllerOnly()
        .build(),
      events.toEntity("analyticsEvent", "AnalyticsEvent", "id")
        .sample({ id = 0; user = anyP; var eventType = #registration : AdminAnalyticsTypes.AnalyticsEventType; var timestamp = 0 : Int; var metadata = null : ?Text })
        .controllerOnly()
        .build(),
    ];
  });
  include ApiDocMixin();
};
