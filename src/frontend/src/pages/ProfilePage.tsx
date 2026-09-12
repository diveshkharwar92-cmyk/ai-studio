import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { LogOut, User } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function ProfilePage() {
  const { isAuthenticated, identity, login, clear } = useInternetIdentity();

  const principalText = identity?.getPrincipal().toText();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information and account."
      />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Your identity is managed through Internet Identity.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="size-16">
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="size-7" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-display text-base font-semibold">
                  {isAuthenticated ? "Signed in" : "Not signed in"}
                </p>
                {isAuthenticated && (
                  <Badge variant="secondary" data-ocid="profile.verified_badge">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {isAuthenticated
                  ? "Your account is connected via Internet Identity."
                  : "Sign in to sync your profile and data."}
              </p>
            </div>
            {!isAuthenticated && (
              <Button
                type="button"
                onClick={() => login()}
                data-ocid="profile.sign_in_button"
              >
                Sign in
              </Button>
            )}
          </div>

          {isAuthenticated && principalText && (
            <>
              <Separator />
              <div className="space-y-1">
                <Label>Principal ID</Label>
                <p
                  className="text-muted-foreground break-all font-mono text-sm"
                  data-ocid="profile.principal"
                >
                  {principalText}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => clear()}
                data-ocid="profile.sign_out_button"
              >
                <LogOut />
                Sign out
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
