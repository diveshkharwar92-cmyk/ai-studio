import { Link } from "@tanstack/react-router";
import { Download, Search, UserRound, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AccountStatus, SubscriptionTier } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminExportUsersCsv,
  useAdminListUsers,
} from "@/hooks/useAdminQueries";
import {
  formatDate,
  formatDateTime,
  formatINR,
  formatNumber,
} from "@/lib/format";

function shortPrincipal(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-6)}`;
}

export function AdminUsersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim() === "" ? null : searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: users, isLoading } = useAdminListUsers(search, null);
  const exportMutation = useAdminExportUsersCsv();

  const handleExport = () => {
    exportMutation.mutate(
      { search, dateRange: null },
      {
        onSuccess: (csv) => {
          if (!csv) return;
          const blob = new Blob([csv.content], {
            type: "text/csv;charset=utf-8;",
          });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = csv.filename;
          anchor.click();
          URL.revokeObjectURL(url);
          toast.success("Users exported");
        },
        onError: () => toast.error("Could not export users"),
      },
    );
  };

  return (
    <div data-ocid="admin_users_page" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Users
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Search, inspect, and export user accounts.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          data-ocid="admin_users.export_button"
          onClick={handleExport}
          disabled={exportMutation.isPending}
        >
          <Download />
          {exportMutation.isPending ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          type="search"
          data-ocid="admin_users.search_input"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, email, or user ID…"
          className="pl-9"
          aria-label="Search users"
        />
      </div>

      <div className="stat-card overflow-hidden p-0">
        {isLoading ? (
          <div data-ocid="admin_users.loading_state" className="p-4">
            {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((id) => (
              <div key={id} className="flex items-center gap-4 py-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : !users || users.length === 0 ? (
          <div
            data-ocid="admin_users.empty_state"
            className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
          >
            <div className="stat-icon">
              <Users className="size-5" />
            </div>
            <p className="font-display text-base font-semibold">
              No users found
            </p>
            <p className="text-muted-foreground max-w-sm text-sm">
              {search
                ? "No users match your search. Try a different name, email, or user ID."
                : "There are no registered users yet."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead className="text-right">AI generations</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead className="text-right">Total spent</TableHead>
                <TableHead>Account status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id.toString()}>
                  <TableCell>
                    <Link
                      to="/admin/users/$userId"
                      params={{ userId: user.id.toString() }}
                      data-ocid={`admin_users.row.${index + 1}`}
                      className="font-mono text-primary hover:underline"
                    >
                      {shortPrincipal(user.id.toString())}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      <UserRound className="text-muted-foreground size-4" />
                      {user.name || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email ?? "—"}
                  </TableCell>
                  <TableCell>{formatDate(user.registeredAt)}</TableCell>
                  <TableCell>{formatDateTime(user.lastActiveAt)}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(user.aiGenerations)}
                  </TableCell>
                  <TableCell>
                    <SubscriptionBadge tier={user.subscriptionStatus.tier} />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatINR(user.totalAmountSpent)}
                  </TableCell>
                  <TableCell>
                    <AccountBadge status={user.accountStatus} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function SubscriptionBadge({ tier }: { tier: SubscriptionTier }) {
  if (tier === SubscriptionTier.pro) {
    return (
      <Badge
        variant="default"
        data-ocid="admin_users.subscription_badge"
        className="bg-primary/10 text-primary"
      >
        Pro
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" data-ocid="admin_users.subscription_badge">
      Free
    </Badge>
  );
}

function AccountBadge({ status }: { status: AccountStatus }) {
  if (status === AccountStatus.active) {
    return (
      <Badge
        variant="secondary"
        data-ocid="admin_users.account_badge"
        className="bg-success/10 text-success"
      >
        Active
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      data-ocid="admin_users.account_badge"
      className="bg-warning/10 text-warning"
    >
      Disabled
    </Badge>
  );
}
