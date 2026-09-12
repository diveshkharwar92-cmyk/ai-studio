import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useUpdateUserSettings, useUserSettings } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const languageOptions = ["English", "Español", "Français", "Deutsch"];

function ThemeSection() {
  const { theme, setTheme } = useTheme();
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateUserSettings();

  const handleThemeChange = (value: string) => {
    setTheme(value);
    updateSettings.mutate({
      theme: value,
      notificationsEnabled: settings?.notificationsEnabled ?? true,
      displayName: settings?.displayName ?? "",
      email: settings?.email ?? null,
      language: settings?.language ?? "English",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>
          Choose how AI Studio looks. Your preference is saved and applied
          across the app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const active = theme === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                variant={active ? "default" : "outline"}
                onClick={() => handleThemeChange(option.value)}
                data-ocid={`settings.theme.${option.value}`}
                className={cn("flex-col gap-1.5 py-4")}
              >
                <Icon className="size-5" />
                {option.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsSection() {
  const { data: settings, isLoading } = useUserSettings();
  const updateSettings = useUpdateUserSettings();

  const notificationsEnabled = settings?.notificationsEnabled ?? true;

  const toggleNotifications = (enabled: boolean) => {
    updateSettings.mutate(
      {
        theme: settings?.theme ?? "system",
        notificationsEnabled: enabled,
        displayName: settings?.displayName ?? "",
        email: settings?.email ?? null,
        language: settings?.language ?? "English",
      },
      {
        onSuccess: () => {
          toast.success(
            enabled ? "Notifications enabled" : "Notifications disabled",
          );
        },
        onError: () => {
          toast.error("Could not update notification preferences");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Choose what updates you'd like to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton
            className="h-12 w-full"
            data-ocid="settings.loading_state"
          />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose what updates you'd like to receive.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="notif-email">Email notifications</Label>
            <p className="text-muted-foreground text-sm">
              Receive updates about your projects and activity.
            </p>
          </div>
          <Switch
            id="notif-email"
            checked={notificationsEnabled}
            onCheckedChange={toggleNotifications}
            data-ocid="settings.notifications_email"
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="notif-product">Product updates</Label>
            <p className="text-muted-foreground text-sm">
              Get notified about new tools and features.
            </p>
          </div>
          <Switch
            id="notif-product"
            checked={notificationsEnabled}
            onCheckedChange={toggleNotifications}
            data-ocid="settings.notifications_product"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsPage() {
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateUserSettings();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("English");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleSave = () => {
    updateSettings.mutate(
      {
        theme: settings?.theme ?? "system",
        notificationsEnabled: settings?.notificationsEnabled ?? true,
        displayName,
        email: email || null,
        language,
      },
      {
        onSuccess: () => {
          toast.success("Settings saved");
        },
        onError: () => {
          toast.error("Could not save settings");
        },
      },
    );
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <PageHeader
        title="Settings"
        description="Manage your preferences and account settings."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your personal information shown across AI Studio.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Display name</Label>
            <Input
              id="settings-name"
              placeholder="Your name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              data-ocid="settings.name_input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input
              id="settings-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              data-ocid="settings.email_input"
            />
          </div>
        </CardContent>
      </Card>

      <ThemeSection />

      <Card>
        <CardHeader>
          <CardTitle>Language</CardTitle>
          <CardDescription>
            Choose the language used across the interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="settings-language">Interface language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger
                id="settings-language"
                className="w-full sm:w-64"
                data-ocid="settings.language_select"
              >
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <NotificationsSection />

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>Control how your data is used.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="privacy-analytics">Usage analytics</Label>
              <p className="text-muted-foreground text-sm">
                Help improve AI Studio with anonymous usage data.
              </p>
            </div>
            <Switch
              id="privacy-analytics"
              checked={analyticsEnabled}
              onCheckedChange={setAnalyticsEnabled}
              data-ocid="settings.privacy_analytics"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account details and security.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-account-name">Display name</Label>
              <Input
                id="settings-account-name"
                placeholder="Your name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                data-ocid="settings.account_name_input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-account-email">Email</Label>
              <Input
                id="settings-account-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                data-ocid="settings.account_email_input"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={handleSave}
            data-ocid="settings.save_button"
          >
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
