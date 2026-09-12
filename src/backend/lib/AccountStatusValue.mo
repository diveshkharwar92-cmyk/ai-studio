import OQL "mo:caffeineai-oql";
import Types "../types/admin-analytics";

module {
  public func _toRow(self : Types.AccountStatus) : OQL.Value =
    #text(switch self { case (#active) "active"; case (#disabled) "disabled" });
};
