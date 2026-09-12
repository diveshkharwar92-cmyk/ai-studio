import OQL "mo:caffeineai-oql";
import Types "../types/data-model";

module {
  public func _toRow(self : Types.GenerationStatus) : OQL.Value =
    #text(switch self { case (#pending) "pending"; case (#completed) "completed"; case (#failed) "failed" });
};
