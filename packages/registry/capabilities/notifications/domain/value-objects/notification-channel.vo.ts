// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { InvalidChannel } from "../errors/invalid-channel.error.js";

export type ChannelType = "email" | "sms" | "push";

const VALID_CHANNELS: ChannelType[] = ["email", "sms", "push"];

export class NotificationChannel {
  readonly value: ChannelType;

  private constructor(value: ChannelType) {
    this.value = value;
  }

  static create(value: string): Result<NotificationChannel, InvalidChannel> {
    if (!VALID_CHANNELS.includes(value as ChannelType)) {
      return Result.fail(InvalidChannel.create(value));
    }
    return Result.ok(new NotificationChannel(value as ChannelType));
  }

  isEmail(): boolean {
    return this.value === "email";
  }

  isSms(): boolean {
    return this.value === "sms";
  }

  isPush(): boolean {
    return this.value === "push";
  }
}
