import { describe, it, expect, beforeEach } from "vitest";
import { ListWebhooks } from "../use-cases/list-webhooks.use-case.js";
import { InMemoryWebhookRepository } from "./mocks/in-memory-webhook-repository.mock.js";
import { InMemoryWebhookDelivery } from "./mocks/in-memory-webhook-delivery.mock.js";
import { createTestWebhook } from "./fixtures/webhook.fixture.js";

describe("ListWebhooks use case", () => {
  let webhookRepo: InMemoryWebhookRepository;
  let webhookDelivery: InMemoryWebhookDelivery;
  let listWebhooks: ListWebhooks;

  beforeEach(async () => {
    webhookRepo = new InMemoryWebhookRepository();
    webhookDelivery = new InMemoryWebhookDelivery();
    listWebhooks = new ListWebhooks(webhookRepo, webhookDelivery);

    await webhookRepo.save(createTestWebhook({ id: "wh-1" }));
    await webhookRepo.save(
      createTestWebhook({
        id: "wh-2",
        url: "https://other.com/hook",
        isActive: false,
      }),
    );
  });

  it("returns all webhooks", async () => {
    const result = await listWebhooks.execute({});

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.webhooks).toHaveLength(2);
    expect(output.total).toBe(2);
  });

  it("filters by isActive", async () => {
    const result = await listWebhooks.execute({ isActive: true });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.webhooks).toHaveLength(1);
    expect(output.webhooks[0].id).toBe("wh-1");
    expect(output.total).toBe(1);
  });

  it("supports limit and offset", async () => {
    const result = await listWebhooks.execute({ limit: 1, offset: 0 });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.webhooks).toHaveLength(1);
    expect(output.total).toBe(2);
  });
});
