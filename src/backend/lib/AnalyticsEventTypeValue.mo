import OQL "mo:caffeineai-oql";
import Types "../types/admin-analytics";

module {
  public func _toRow(self : Types.AnalyticsEventType) : OQL.Value =
    #text(switch self {
      case (#registration) "registration";
      case (#login) "login";
      case (#generationStarted) "generation_started";
      case (#generationCompleted) "generation_completed";
      case (#generationFailed) "generation_failed";
      case (#subscriptionStarted) "subscription_started";
      case (#subscriptionRenewed) "subscription_renewed";
      case (#subscriptionCancelled) "subscription_cancelled";
      case (#paymentCompleted) "payment_completed";
    });
};
