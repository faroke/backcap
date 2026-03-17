import { describe, it, expect } from "vitest";
import { Webhook } from "../entities/webhook.entity.js";
import { InvalidWebhookUrl } from "../errors/invalid-webhook-url.error.js";

describe("Webhook entity", () => {
  const validParams = {
    id: "webhook-1",
    url: "https://example.com/webhook",
    events: ["order.created", "order.updated"],
    secret: "super-secret",
    allowPrivateUrl: true,
  };

  it("creates a valid webhook", () => {
    const result = Webhook.create(validParams);
    expect(result.isOk()).toBe(true);
    const webhook = result.unwrap();
    expect(webhook.id).toBe("webhook-1");
    expect(webhook.url.value).toBe("https://example.com/webhook");
    expect(webhook.events).toEqual(["order.created", "order.updated"]);
    expect(webhook.secret).toBe("super-secret");
    expect(webhook.isActive).toBe(true);
    expect(webhook.createdAt).toBeInstanceOf(Date);
  });

  it("creates webhook with isActive defaulting to true", () => {
    const result = Webhook.create(validParams);
    expect(result.unwrap().isActive).toBe(true);
  });

  it("creates webhook with isActive explicitly set to false", () => {
    const result = Webhook.create({ ...validParams, isActive: false });
    expect(result.unwrap().isActive).toBe(false);
  });

  it("fails with invalid URL", () => {
    const result = Webhook.create({ ...validParams, url: "not-a-url" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidWebhookUrl);
  });

  it("fails with empty events array", () => {
    const result = Webhook.create({ ...validParams, events: [] });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toMatch(/at least one event/);
  });

  it("activate succeeds on inactive webhook", () => {
    const webhook = Webhook.create({ ...validParams, isActive: false }).unwrap();
    const result = webhook.activate();
    expect(result.isOk()).toBe(true);
    expect(webhook.isActive).toBe(true);
  });

  it("activate fails on already active webhook", () => {
    const webhook = Webhook.create(validParams).unwrap();
    const result = webhook.activate();
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toMatch(/already active/);
  });

  it("deactivate succeeds on active webhook", () => {
    const webhook = Webhook.create(validParams).unwrap();
    const result = webhook.deactivate();
    expect(result.isOk()).toBe(true);
    expect(webhook.isActive).toBe(false);
  });

  it("deactivate fails on already inactive webhook", () => {
    const webhook = Webhook.create({ ...validParams, isActive: false }).unwrap();
    const result = webhook.deactivate();
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toMatch(/already inactive/);
  });

  it("accepts http URL", () => {
    const result = Webhook.create({ ...validParams, url: "http://example.com/hook" });
    expect(result.isOk()).toBe(true);
  });
});
