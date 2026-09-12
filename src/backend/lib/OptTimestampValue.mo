import OQL "mo:caffeineai-oql";

module {
  public func _toRow(self : ?Int) : OQL.Value =
    switch self { case null { #int(0) }; case (?t) { #int(t) } };
};
