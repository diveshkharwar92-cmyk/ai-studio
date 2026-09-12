import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { LogOut, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const { isAuthenticated, login, clear } = useInternetIdentity();

  if (!isAuthenticated) {
    return (
      <Button
        variant="default"
        size="sm"
        type="button"
        onClick={() => login()}
        data-ocid="auth.sign_in_button"
      >
        Sign in
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label="Account menu"
          data-ocid="auth.account_menu"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => clear()}
          data-ocid="auth.sign_out_button"
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
