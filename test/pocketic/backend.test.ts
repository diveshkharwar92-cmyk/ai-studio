import { PocketIc, type Actor } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

type PrincipalType = Parameters<Actor<_SERVICE>["setPrincipal"]>[0];

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let userPrincipal: PrincipalType;
let otherPrincipal: PrincipalType;
let unauthorizedPrincipal: PrincipalType;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  const installed = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  });
  actor = installed.actor;
  // Canister ids are non-anonymous principals we can use as callers.
  userPrincipal = installed.canisterId;
  otherPrincipal = await pic.createCanister();
  unauthorizedPrincipal = await pic.createCanister();
  // Register the caller as an authorized user (the first caller becomes admin).
  actor.setPrincipal(userPrincipal);
  await actor._initialize_access_control();
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers an empty-state read instead of trapping", async () => {
  await expect(actor.listProjects()).resolves.toEqual([]);
  await expect(actor.listConversations()).resolves.toEqual([]);
  await expect(actor.listFiles()).resolves.toEqual([]);
  await expect(actor.listGenerations()).resolves.toEqual([]);
});

it("rejects an unregistered caller without trapping", async () => {
  actor.setPrincipal(unauthorizedPrincipal);
  await expect(actor.listProjects()).resolves.toEqual([]);
  await expect(actor.createProject("x")).resolves.toMatchObject({ name: "" });
  await expect(
    actor.saveFile([], { name: "a.png", mimeType: "image/png", sizeBytes: 0n }),
  ).resolves.toEqual({ err: { notAuthorized: null } });
  actor.setPrincipal(userPrincipal);
});

it("round-trips a project through the real canister", async () => {
  const project = await actor.createProject("My project");
  expect(project.name).toBe("My project");
  expect(await actor.listProjects()).toContainEqual(
    expect.objectContaining({ id: project.id, name: "My project" }),
  );
});

it("round-trips a conversation and its messages", async () => {
  const conversation = await actor.createConversation("Hello");
  expect(conversation.title).toBe("Hello");

  const userMessage = await actor.addMessage(conversation.id, "Hi there");
  expect(userMessage).not.toBeNull();
  expect(userMessage?.[0].content).toBe("Hi there");

  const messages = await actor.listMessages(conversation.id);
  expect(messages).toHaveLength(1);
  expect(messages[0]).toMatchObject({ content: "Hi there" });

  // chat returns a provider result (ok or providerNotConfigured) without trapping
  const chatResult = await actor.chat(conversation.id, "Hi there");
  expect(["ok", "providerNotConfigured"]).toContain(Object.keys(chatResult)[0]);

  // delete the conversation
  expect(await actor.deleteConversation(conversation.id)).toBe(true);
  expect(await actor.listConversations()).not.toContainEqual(
    expect.objectContaining({ id: conversation.id }),
  );
});

it("round-trips user settings and subscription", async () => {
  const settings = await actor.updateUserSettings(
    "dark",
    true,
    "Ada",
    [],
    "English",
  );
  expect(settings.theme).toBe("dark");
  expect(settings.notificationsEnabled).toBe(true);
  expect(settings.displayName).toBe("Ada");
  // getUserSettings returns an optional ?UserSettingsView, decoded as [] | [T].
  expect((await actor.getUserSettings())?.[0]).toMatchObject({
    theme: "dark",
    displayName: "Ada",
  });

  const subscription = await actor.updateSubscription({ free: null }, []);
  expect(subscription.tier).toEqual({ free: null });
  // getSubscription returns an optional ?SubscriptionStatusView, decoded as [] | [T].
  expect((await actor.getSubscription())?.[0]).toMatchObject({
    tier: { free: null },
  });
});

it("answers image generation without trapping", async () => {
  const result = await actor.generateImage(0n, "a red apple");
  expect(["ok", "providerNotConfigured"]).toContain(Object.keys(result)[0]);
});

it("round-trips a saved file", async () => {
  const result = await actor.saveFile([], {
    name: "image.png",
    mimeType: "image/png",
    sizeBytes: 0n,
  });
  expect(result).toHaveProperty("ok");
  expect(await actor.listFiles()).toHaveLength(1);
});

it("does not show one caller's data to another", async () => {
  actor.setPrincipal(userPrincipal);
  const project = await actor.createProject("Private project");
  expect(await actor.listProjects()).toContainEqual(
    expect.objectContaining({ id: project.id }),
  );

  // Register OTHER as a separate authorized user; it must not see USER's data.
  actor.setPrincipal(otherPrincipal);
  await actor._initialize_access_control();
  expect(await actor.listProjects()).toEqual([]);

  // USER still sees their own project.
  actor.setPrincipal(userPrincipal);
  expect(await actor.listProjects()).toContainEqual(
    expect.objectContaining({ id: project.id }),
  );
});
