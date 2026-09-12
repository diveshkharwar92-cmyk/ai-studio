import OQL "mo:caffeineai-oql";

module {
  public func _toRow(self : ?Nat) : OQL.Value =
    switch self { case null { #nat(0) }; case (?n) { #nat(n) } };
};
