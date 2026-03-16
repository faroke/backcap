import { describe, it, expect } from "vitest";
import { Webhook } from "../entities/webhook.entity.js";
import { InvalidWebhookUrl } from "../errors/invalid-webhook-url.error.js";

describe("Webhook entity", () => {
  const validParams = {
    id: "webhook-1",
    url: "https://example.com/webhook",
    events: ["order.created", "order.updated"],
    secret: "super-secret",
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

  it("activate returns a new webhook with isActive true", () => {
    const webhook = Webhook.create({ ...validParams, isActive: false }).unwrap();
    const activated = webhook.activate();
    expect(activated.isActive).toBe(true);
    // Original unchanged
    expect(webhook.isActive).toBe(false);
  });

  it("deactivate returns a new webhook with isActive false", () => {
    const webhook = Webhook.create(validParams).unwrap();
    const deactivated = webhook.deactivate();
    expect(deactivated.isActive).toBe(false);
    // Original unchanged
    expect(webhook.isActive).toBe(true);
  });

  it("accepts http URL", () => {
    const result = Webhook.create({ ...validParams, url: "http://example.com/hook" });
    expect(result.isOk()).toBe(true);
  });
});
