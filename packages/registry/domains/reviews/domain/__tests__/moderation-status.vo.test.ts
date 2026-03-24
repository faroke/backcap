import { describe, it, expect } from "vitest";
import { ModerationStatus } from "../value-objects/moderation-status.vo.js";

describe("ModerationStatus", () => {
  it("pending() creates status with value 'pending' and isPending() returns true", () => {
    const status = ModerationStatus.pending();
    expect(status.value).toBe("pending");
    expect(status.isPending()).toBe(true);
    expect(status.isApproved()).toBe(false);
    expect(status.isRejected()).toBe(false);
  });

  it("approved() creates status with value 'approved' and isApproved() returns true", () => {
    const status = ModerationStatus.approved();
    expect(status.value).toBe("approved");
    expect(status.isApproved()).toBe(true);
    expect(status.isPending()).toBe(false);
    expect(status.isRejected()).toBe(false);
  });

  it("rejected() creates status with value 'rejected' and isRejected() returns true", () => {
    const status = ModerationStatus.rejected();
    expect(status.value).toBe("rejected");
    expect(status.isRejected()).toBe(true);
    expect(status.isPending()).toBe(false);
    expect(status.isApproved()).toBe(false);
  });

  it("isPending() returns false for approved and rejected", () => {
    expect(ModerationStatus.approved().isPending()).toBe(false);
    expect(ModerationStatus.rejected().isPending()).toBe(false);
  });

  it("from() reconstitutes from string value", () => {
    const pending = ModerationStatus.from("pending");
    expect(pending.isPending()).toBe(true);
    const approved = ModerationStatus.from("approved");
    expect(approved.isApproved()).toBe(true);
    const rejected = ModerationStatus.from("rejected");
    expect(rejected.isRejected()).toBe(true);
  });
});
