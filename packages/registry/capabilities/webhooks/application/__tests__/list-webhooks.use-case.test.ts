import { describe, it, expect, beforeEach } from "vitest";
import { ListWebhooks } from "../use-cases/list-webhooks.use-case.js";
import { InMemoryWebhookRepository } from "./mocks/webhook-repository.mock.js";
import { createTestWebhook } from "./fixtures/webhook.fixture.js";

describe("ListWebhooks use case", () => {
  let webhookRepo: InMemoryWebhookRepository;
  let listWebhooks: ListWebhooks;

  beforeEach(async () => {
    webhookRepo = new InMemoryWebhookRepository();
    listWebhooks = new ListWebhooks(webhookRepo);

    await webhookRepo.save(createTestWebhook({ id: "wh-1" }));
    await webhookRepo.save(createTestWebhook({ id: "wh-2", url: "https://other.com/hook" }));
  });

  it("returns all webhooks", async () => {
    const result = await listWebhooks.execute();

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.webhooks).toHaveLength(2);
  });
});
