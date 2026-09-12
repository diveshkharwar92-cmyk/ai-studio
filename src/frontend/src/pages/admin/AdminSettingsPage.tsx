import { Coins, Save, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { NotConnected } from "@/components/admin/not-connected";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminGetSettings,
  useAdminUpdateOtherCosts,
} from "@/hooks/useAdminQueries";
import { formatINR } from "@/lib/format";

/**
 * Admin settings page. The admin configures the "other costs" figure that is
 * subtracted from revenue in the profit formula. The AI API cost is shown as
 * "Not connected" because no AI provider is wired up yet — we never invent
 * cost data for an unconnected integration.
 */
export function AdminSettingsPage() {
  const { data, isLoading } = useAdminGetSettings();
  const updateOtherCosts = useAdminUpdateOtherCosts();

  const [draft, setDraft] = useState("");

  const currentOtherCosts = data?.otherCosts ?? 0n;

  const handleSave = () => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast.error("Enter a valid non-negative amount");
      return;
    }
    const value = BigInt(Math.round(parsed));
    const captured = draft;
    setDraft("");
    updateOtherCosts.mutate(value, {
      onSuccess: () => {
        toast.success("Other costs updated");
      },
      onError: () => {
        setDraft((current) => (current === "" ? captured : current));
        toast.error("Could not update other costs");
      },
    });
  };

  return (
    <div data-ocid="admin.settings.page" className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure platform costs used in the profit formula.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* AI API cost — no AI provider connected */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-muted-foreground" />
              AI API Cost
            </CardTitle>
            <CardDescription>
              Cost of AI API usage across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotConnected label="AI provider not connected" />
            <p className="text-muted-foreground mt-3 text-xs">
              Connect an AI provider to track API costs. No cost data is shown
              until then.
            </p>
          </CardContent>
        </Card>

        {/* Other costs — admin-configurable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="size-4 text-muted-foreground" />
              Other Costs
            </CardTitle>
            <CardDescription>
              Fixed operating costs subtracted from revenue in the profit
              formula.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {isLoading || !data ? (
              <div className="space-y-3">
                <Skeleton
                  className="h-4 w-32"
                  data-ocid="admin.settings.loading_state"
                />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div>
                  <p className="text-muted-foreground text-sm">Current value</p>
                  <p className="font-display mt-1 text-2xl font-bold tracking-tight">
                    {formatINR(currentOtherCosts)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-other-costs">
                    Update other costs (₹)
                  </Label>
                  <Input
                    id="admin-other-costs"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    placeholder={String(currentOtherCosts)}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    data-ocid="admin.settings.other_costs_input"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={updateOtherCosts.isPending || draft === ""}
                  data-ocid="admin.settings.save_button"
                >
                  <Save />
                  {updateOtherCosts.isPending ? "Saving…" : "Save changes"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
