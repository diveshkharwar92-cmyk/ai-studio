import OQL "mo:caffeineai-oql";
import Types "../types/data-model";

module {
  public func _toRow(self : Types.ChatRole) : OQL.Value =
    #text(switch self { case (#user) "user"; case (#assistant) "assistant" });
};
