mixin () {
  public query func getApiDoc() : async Text {
    "# AI Creative Studio — Backend API

## Purpose

The backend canister for the AI Creative Studio app. It stores and manages the
user's persisted data — projects, saved files, chat conversations and messages,
user settings, and subscription status — and exposes an OQL query layer over
that data. It also maintains an admin analytics subsystem: a user registry, a
stream of analytics events, and a set of admin-only read endpoints that compute
dashboard, user, feature-usage, subscription, and revenue/profit metrics from
real database state. The AI provider interfaces (`chat`, `generateImage`) are
present so a provider can be connected later without rebuilding the UI; until
one is configured they return `#providerNotConfigured` and never fabricate
output. Likewise, no payment, advertising, or AI-cost provider is connected, so
the revenue and profit figures report `#notConnected` rather than inventing
numbers.

## Public methods

### Access control / identity
- `_internet_identity_sign_in_start() : async Blob` — begins an Internet
  Identity sign-in; returns a challenge blob.
- `_internet_identity_sign_in_finish() : async Result<(), Error>` — completes
  the sign-in and registers the caller.
- `_initialize_access_control() : async ()` — registers the caller (see
  Authentication).
- `getCallerUserRole() : async UserRole` — returns the caller's role
  (`#admin`, `#user`, or `#guest` for anonymous).
- `assignCallerUserRole(user : Principal, role : UserRole) : async ()` — admin
  only; assigns a role to another principal.
- `isCallerAdmin() : async Bool` — whether the caller is an admin.

### Projects
- `createProject(name : Text) : async ProjectView`
- `listProjects() : async [ProjectView]`
- `renameProject(projectId : Nat, name : Text) : async ?ProjectView`
- `deleteProject(projectId : Nat) : async Bool`

### Saved files
- `saveFile(projectId : ?Nat, upload : FileUpload) : async Result<SavedFileView, FileUploadError>`
- `listFiles() : async [SavedFileView]`
- `deleteFile(fileId : Nat) : async Bool`

### Chat
- `createConversation(title : Text) : async ChatConversationView`
- `listConversations() : async [ChatConversationView]`
- `addMessage(conversationId : Nat, content : Text) : async ?ChatMessageView`
- `listMessages(conversationId : Nat) : async [ChatMessageView]`
- `deleteConversation(conversationId : Nat) : async Bool`

### User settings
- `getUserSettings() : async ?UserSettingsView`
- `updateUserSettings(theme : Text, notificationsEnabled : Bool, displayName : Text, email : ?Text, language : Text) : async UserSettingsView`

### Subscription
- `getSubscription() : async ?SubscriptionStatusView`
- `updateSubscription(tier : SubscriptionTier, expiresAt : ?Timestamp) : async SubscriptionStatusView`

### AI provider interfaces
- `chat(conversationId : Nat, message : Text) : async ChatResult` — returns
  `#providerNotConfigured` until a provider is configured.
- `generateImage(projectId : Nat, prompt : Text) : async ImageGenerationResult`
  — returns `#providerNotConfigured` until a provider is configured.
- `listGenerations() : async [GenerationView]` — lists the caller's persisted
  generations. Because no provider is configured, `generateImage` never produces
  a generation, so this is empty until a provider is connected.

### Admin analytics (admin-only)

Every method in this section is guarded server-side: it traps with
`Unauthorized: Only admins can perform this action` unless the caller is a
signed-in principal holding the `#admin` role. Anonymous, unregistered, and
`#user` callers are rejected. These endpoints read the admin analytics state
(user registry, analytics events, generations, subscriptions, settings) and
never mutate it, except `adminUpdateOtherCosts`, which updates the admin
settings.

- `adminGetDashboardOverview() : async DashboardOverview` — the eight main
  stat cards (total users, active users today, active users this month, new
  users today, total AI generations, premium users, total revenue, estimated
  profit), all computed from real database state.
- `adminGetUserMetrics() : async UserMetrics` — total registered, new
  today/week/month, daily active, monthly active, returning users, and
  retention rate.
- `adminGetChartSeries(range : ChartRange) : async ChartSeries` — per-day
  series of new users, active users, and retention for the last 7, 30, or 90
  days (`#last7Days`, `#last30Days`, `#last90Days`).
- `adminGetFeatureUsage() : async [FeatureUsage]` — per-AI-tool totals:
  total/successful/failed generations, number of users, and average
  generations per user.
- `adminGetSubscriptionMetrics() : async SubscriptionMetrics` — free users,
  premium users, active subscriptions, new/cancelled subscriptions, renewals,
  and subscription revenue.
- `adminListUsers(search : ?Text, dateRange : ?DateRange) : async [AdminUserRow]`
  — searchable user table (user ID, name, email, registration date, last
  active, AI generations, subscription status, total amount spent, account
  status).
- `adminGetUserDetail(userId : Principal) : async ?UserDetail` — a single
  user's analytics/details page; returns `null` when the user is not
  registered.
- `adminExportUsersCsv(search : ?Text, dateRange : ?DateRange) : async CsvExport`
  — CSV of the filtered user table.
- `adminExportAnalyticsCsv(dateRange : ?DateRange) : async CsvExport` — CSV of
  the filtered analytics events.
- `adminGetSettings() : async AdminSettingsView` — the admin-configurable
  settings (currently `otherCosts`).
- `adminUpdateOtherCosts(otherCosts : Nat) : async AdminSettingsView` — sets
  the admin-configurable `otherCosts` figure used in the profit estimate.

### OQL data querying
- `schema() : async Text` — the OQL schema over the persisted entities.
- `execute(query : Text) : async Text` — run an OQL JSON query.

### Documentation
- `getApiDoc() : async Text` — this document.

## Authentication and authorization

Every data endpoint requires a signed-in (non-anonymous) caller holding the
`#user` role (admins also pass). The frontend pins an Internet Identity
derivation origin, published at `/.well-known/ii-derivation-origin` when
available; an agent already holding the user's Internet Identity authorization
derives the correct per-app principal against that origin (for example
`icp identity link web <name> --app <host>`). Such a delegation acts with the
user's full authority in this app until it expires.

Registration gates access. A direct API caller registers by calling
`_initialize_access_control` once as a signed-in caller before any role-guarded
call (guarded queries included). The first caller to initialize becomes
`#admin`; every subsequent caller becomes `#user`. A caller can be unregistered
while the app already knows it because registration happens only when a caller
signs in through the app's own frontend — a principal that never did so is
unregistered even when it belongs to the app's owner, and a signed-in caller
derived against a different origin is a different principal than the one the
frontend registered.

- Anonymous or unregistered caller on a data-model endpoint: the method answers
  gracefully instead of trapping — list methods return `[]`, option methods
  return `null`, boolean methods return `false`, `saveFile` returns
  `#err(#notAuthorized)`, `chat`/`generateImage` return `#providerNotConfigured`,
  and the create/update methods that return a view return an empty view. No data
  is read or written for such a caller.
- `assignCallerUserRole` from a non-admin traps with
  `Unauthorized: Only admins can assign user roles`.
- Every admin analytics endpoint from a non-admin (anonymous, unregistered, or
  `#user`) traps with `Unauthorized: Only admins can perform this action`. The
  admin role is validated server-side on every call — it is never only hidden
  in the UI. Admin analytics data is never exposed to normal users.

### Analytics event recording

The backend records real activity as analytics events in the `events` store,
each with a `user`, an `eventType`, a `timestamp`, and optional `metadata`.
Events are recorded automatically from real activity:

- `#registration` and `#login` — recorded when a caller signs in through the
  app's Internet Identity flow (the first sign-in of a new caller records
  `#registration`, and every sign-in records `#login`).
- `#generationStarted`, `#generationCompleted`, `#generationFailed` — recorded
  around AI generation lifecycle.
- `#subscriptionStarted`, `#subscriptionRenewed`, `#subscriptionCancelled` —
  recorded around subscription lifecycle.
- `#paymentCompleted` — recorded when a payment completes.

Because no payment or AI provider is connected, generation and payment events
are not currently produced by real activity; the event stream reflects whatever
activity actually occurs. Event IDs are drawn from a dedicated `nextEventId`
counter.

## Units and encodings

- Timestamps (`createdAt`, `updatedAt`, `expiresAt`) are `Int` nanoseconds
  since the Unix epoch (`Time.now()`).
- IDs (`id`, `projectId`, `conversationId`) are `Nat` counters drawn from a
  single shared `nextId` counter.
- `owner` is a `Principal` (the user who created the row).
- `SavedFileView.projectId` is an optional `?Nat` (a file may not belong to a
  project).
- `ChatMessageView.role` is `#user` or `#assistant`.
- `SubscriptionStatusView.tier` is `#free` or `#pro`; `expiresAt` is an optional
  `?Timestamp`.
- `UserSettingsView` carries `theme`, `notificationsEnabled`, `displayName`,
  `language` (all `Text`/`Bool`) and `email` (an optional `?Text`).
- `FileUpload` is `{ name : Text; mimeType : Text; sizeBytes : Nat }`.
- Admin analytics: `UserRecord` fields `registeredAt` / `lastActiveAt` and
  `AnalyticsEvent.timestamp` are `Int` nanoseconds since the Unix epoch
  (`Time.now()`). `AnalyticsEvent.eventType` is one of `#registration`,
  `#login`, `#generationStarted`, `#generationCompleted`, `#generationFailed`,
  `#subscriptionStarted`, `#subscriptionRenewed`, `#subscriptionCancelled`,
  `#paymentCompleted`. `UserRecord.accountStatus` is `#active` or `#disabled`.
  `metadata` is an optional `?Text`. `ChartRange` is `#last7Days`,
  `#last30Days`, or `#last90Days`; `DateRange` is `#today`, `#last7Days`,
  `#last30Days`, `#last90Days`, or `#custom { from; to }` (both `Int`
  nanoseconds). Currency figures (`RevenueSummary`, `ProfitSummary`,
  `totalAmountSpent`, `otherCosts`) are `Nat` in Indian Rupees (₹).

## Lifecycle and polling

`chat` and `generateImage` return `#providerNotConfigured` immediately; there is
no async job to poll. All other mutations complete synchronously in the same
message. The admin analytics endpoints are synchronous reads (queries) that
compute their metrics on demand from current database state — there is no
cached or batched analytics pipeline to poll, so the dashboard reflects the
latest state on every call.

## Mutation retry safety

- `createProject`, `createConversation`, `saveFile`, and `addMessage` allocate a
  fresh id from the shared `nextId` counter on every call, so retrying a
  message creates a duplicate row. There is no idempotency key.
- `updateUserSettings` and `updateSubscription` are idempotent upserts keyed by
  the caller's `owner` principal — retrying overwrites with the same value.
- `renameProject` and `deleteProject` return `null` / `false` when the project
  does not exist or is not owned by the caller; they are safe to retry.
- `deleteProject` permanently removes the project row.
- `deleteFile` returns `false` when the file does not exist or is not owned by
  the caller; it permanently removes the file row.
- `deleteConversation` returns `false` when the conversation does not exist or
  is not owned by the caller; it permanently removes the conversation and every
  message belonging to it.
- `adminUpdateOtherCosts` is an idempotent overwrite of the single
  `adminSettings.otherCosts` value — retrying with the same value is a no-op.
  All other admin analytics endpoints are read-only queries and are safe to
  retry.

## Errors, limits, and gotchas

- `saveFile` validates the upload: a `sizeBytes` over 10 MB returns
  `#err(#tooLarge(sizeBytes))`; a `mimeType` outside the allowed set
  (`image/png`, `image/jpeg`, `image/gif`, `image/webp`, `application/pdf`,
  `text/plain`, `video/mp4`, `audio/mpeg`) returns
  `#err(#unsupportedType(mimeType))`. An unauthorized caller receives
  `#err(#notAuthorized)`.
- `addMessage` returns `null` when the conversation does not exist or is not
  owned by the caller.
- OQL `schema()` / `execute()` are per-table authorized: every persisted entity
  is `controllerOrScoped` — the platform controller (agent) reads all rows,
  while each signed-in user reads only rows whose `owner` is themselves. A
  scoped user can never see another user's rows through a query or a join. The
  two admin analytics entities — `userRecord` (the user registry) and
  `analyticsEvent` (the event stream) — are `controllerOnly`: only the platform
  controller (admin/agent) reads them, and no end user can query them, keeping
  admin analytics private.
- The OQL schema lists fields in lexicographic order; sort client-side if
  display order matters.
- Optional and variant fields are exposed with sentinel values: absent
  `projectId` / `expiresAt` become `0`, and `role` / `tier` become their text
  tags (`user`, `assistant`, `free`, `pro`).
- Revenue and profit reporting: because no payment, advertising, or AI-cost
  provider is connected, `RevenueSummary` and `ProfitSummary` carry
  `status = #notConnected` and zeroed amounts rather than fabricated figures.
  `ProfitSummary.otherCosts` reflects the admin-configurable `otherCosts`
  setting, and `profitMargin` is `null` until a revenue source is connected.
  The dashboard shows these as \"Not connected\" rather than inventing data."
  };
};
