import { Check, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSubscription } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";

interface Plan {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    description: "For getting started with AI Studio.",
    features: [
      "Access to core AI tools",
      "Up to 20 generations per month",
      "Standard response speed",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$12",
    description: "For power users who need more.",
    features: [
      "Unlimited AI generations",
      "Priority response speed",
      "Advanced tools & features",
      "Priority support",
    ],
    highlighted: true,
  },
];

export function SubscriptionPage() {
  const { data: subscription } = useSubscription();
  const currentTier = subscription?.tier ?? "free";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Subscription"
        description="Choose the plan that fits how you work."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const isCurrent = plan.name.toLowerCase() === currentTier;
          return (
            <Card
              key={plan.name}
              className={cn(
                "relative",
                plan.highlighted &&
                  "border-primary shadow-elevated ring-primary/20 ring-1",
              )}
            >
              {plan.highlighted && (
                <Badge className="bg-gradient-primary absolute -top-3 left-6 text-white">
                  <Sparkles />
                  Most popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="font-display text-xl">
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">/ month</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="text-primary mt-0.5 size-4 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant={plan.highlighted ? "default" : "outline"}
                  disabled={isCurrent}
                  data-ocid={`subscription.${plan.name.toLowerCase()}_button`}
                >
                  {isCurrent
                    ? "Current plan"
                    : plan.highlighted
                      ? "Upgrade to Pro"
                      : "Downgrade to Free"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div
        className="bg-accent/10 text-accent-foreground rounded-lg px-4 py-3 text-sm"
        data-ocid="subscription.payment_not_configured"
      >
        Payments are not processed yet. Connect a payment provider to enable Pro
        upgrades.
      </div>
    </div>
  );
}
