import OQL "mo:caffeineai-oql";

module {
  public func _toRow(self : ?Text) : OQL.Value =
    switch self { case null { #text("") }; case (?t) { #text(t) } };
};
