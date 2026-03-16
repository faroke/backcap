import { describe, it, expect, beforeEach } from "vitest";
import { TriggerWebhook } from "../use-cases/trigger-webhook.use-case.js";
import { InMemoryWebhookRepository } from "./mocks/webhook-repository.mock.js";
import { InMemoryWebhookDelivery } from "./mocks/webhook-delivery.mock.js";
import { createTestWebhook } from "./fixtures/webhook.fixture.js";

describe("TriggerWebhook use case", () => {
  let webhookRepo: InMemoryWebhookRepository;
  let webhookDelivery: InMemoryWebhookDelivery;
  let triggerWebhook: TriggerWebhook;

  beforeEach(async () => {
    webhookRepo = new InMemoryWebhookRepository();
    webhookDelivery = new InMemoryWebhookDelivery();
    triggerWebhook = new TriggerWebhook(webhookRepo, webhookDelivery);

    await webhookRepo.save(createTestWebhook({ id: "wh-1", events: ["user.created"] }));
    await webhookRepo.save(createTestWebhook({ id: "wh-2", events: ["post.published"], url: "https://other.com/hook" }));
  });

  it("delivers to webhooks matching event type", async () => {
    const result = await triggerWebhook.execute({
      eventType: "user.created",
      payload: { userId: "123" },
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.delivered).toBe(1);
    expect(output.failed).toBe(0);
    expect(output.events).toHaveLength(1);
    expect(webhookDelivery.deliveries).toHaveLength(1);
  });

  it("counts delivery failures", async () => {
    webhookDelivery.shouldFail = true;

    const result = await triggerWebhook.execute({
      eventType: "user.created",
      payload: { userId: "123" },
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.delivered).toBe(0);
    expect(output.failed).toBe(1);
  });

  it("skips webhooks not matching event type", async () => {
    const result = await triggerWebhook.execute({
      eventType: "order.completed",
      payload: {},
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.delivered).toBe(0);
    expect(output.failed).toBe(0);
  });
});
