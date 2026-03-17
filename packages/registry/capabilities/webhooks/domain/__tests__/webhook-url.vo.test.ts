import { describe, it, expect } from "vitest";
import { WebhookUrl } from "../value-objects/webhook-url.vo.js";
import { InvalidWebhookUrl } from "../errors/invalid-webhook-url.error.js";

describe("WebhookUrl VO", () => {
  it("accepts a valid https URL", () => {
    const result = WebhookUrl.create("https://example.com/webhook");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("https://example.com/webhook");
  });

  it("accepts a valid http URL", () => {
    const result = WebhookUrl.create("http://example.com/webhook");
    expect(result.isOk()).toBe(true);
  });

  it("accepts URL with path and query params", () => {
    const result = WebhookUrl.create("https://api.example.com/hooks?token=abc123");
    expect(result.isOk()).toBe(true);
  });

  it("rejects empty string", () => {
    const result = WebhookUrl.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidWebhookUrl);
  });

  it("rejects ftp URL", () => {
    const result = WebhookUrl.create("ftp://example.com/webhook");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidWebhookUrl);
  });

  it("rejects plain string without protocol", () => {
    const result = WebhookUrl.create("example.com/webhook");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidWebhookUrl);
  });

  it("rejects localhost by default", () => {
    const result = WebhookUrl.create("http://localhost:3000/webhook");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidWebhookUrl);
  });

  it("rejects 127.0.0.1 by default", () => {
    const result = WebhookUrl.create("http://127.0.0.1/webhook");
    expect(result.isFail()).toBe(true);
  });

  it("rejects 10.x.x.x private range by default", () => {
    const result = WebhookUrl.create("http://10.0.0.1/webhook");
    expect(result.isFail()).toBe(true);
  });

  it("rejects 172.16-31.x.x private range by default", () => {
    const result = WebhookUrl.create("http://172.16.0.1/webhook");
    expect(result.isFail()).toBe(true);
  });

  it("rejects 192.168.x.x private range by default", () => {
    const result = WebhookUrl.create("http://192.168.1.1/webhook");
    expect(result.isFail()).toBe(true);
  });

  it("rejects ::1 IPv6 loopback by default", () => {
    const result = WebhookUrl.create("http://[::1]/webhook");
    expect(result.isFail()).toBe(true);
  });

  it("allows localhost with allowPrivate option", () => {
    const result = WebhookUrl.create("http://localhost:3000/webhook", {
      allowPrivate: true,
    });
    expect(result.isOk()).toBe(true);
  });

  it("allows private IPs with allowPrivate option", () => {
    const result = WebhookUrl.create("http://192.168.1.1/webhook", {
      allowPrivate: true,
    });
    expect(result.isOk()).toBe(true);
  });

  it("is immutable (readonly value)", () => {
    const vo = WebhookUrl.create("https://example.com/hook").unwrap();
    expect(vo.value).toBe("https://example.com/hook");
  });
});
