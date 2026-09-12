import OQL "mo:caffeineai-oql";
import Types "../types/data-model";

module {
  public func _toRow(self : Types.SubscriptionTier) : OQL.Value =
    #text(switch self { case (#free) "free"; case (#pro) "pro" });
};
