// Template: import type { INotificationRepository } from "{{cap_rel}}/notifications/application/ports/notification-repository.port.js";
import type { INotificationRepository } from "../../../capabilities/notifications/application/ports/notification-repository.port.js";
// Template: import { Notification } from "{{cap_rel}}/notifications/domain/entities/notification.entity.js";
import { Notification } from "../../../capabilities/notifications/domain/entities/notification.entity.js";
// Template: import type { NotificationStatus } from "{{cap_rel}}/notifications/domain/entities/notification.entity.js";
import type { NotificationStatus } from "../../../capabilities/notifications/domain/entities/notification.entity.js";

interface PrismaNotificationRecord {
  id: string;
  channel: string;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  sentAt: Date | null;
}

interface PrismaNotificationDelegate {
  findUnique(args: { where: { id: string } }): Promise<PrismaNotificationRecord | null>;
  findMany(args?: { where?: { recipient?: string } }): Promise<PrismaNotificationRecord[]>;
  create(args: { data: PrismaNotificationRecord }): Promise<PrismaNotificationRecord>;
  upsert(args: {
    where: { id: string };
    create: PrismaNotificationRecord;
    update: Partial<PrismaNotificationRecord>;
  }): Promise<PrismaNotificationRecord>;
}

interface PrismaClient {
  notificationRecord: PrismaNotificationDelegate;
}

export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(notification: Notification): Promise<void> {
    const data = this.toPrisma(notification);
    await this.prisma.notificationRecord.upsert({
      where: { id: notification.id },
      create: data,
      update: data,
    });
  }

  async findById(notificationId: string): Promise<Notification | null> {
    const record = await this.prisma.notificationRecord.findUnique({
      where: { id: notificationId },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByRecipient(recipient: string): Promise<Notification[]> {
    const records = await this.prisma.notificationRecord.findMany({
      where: { recipient },
    });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: PrismaNotificationRecord): Notification {
    const result = Notification.create({
      id: record.id,
      channel: record.channel,
      recipient: record.recipient,
      subject: record.subject,
      body: record.body,
      status: record.status as NotificationStatus,
      sentAt: record.sentAt,
    });
    // Data from DB is trusted; unwrap safely
    return result.unwrap();
  }

  private toPrisma(notification: Notification): PrismaNotificationRecord {
    return {
      id: notification.id,
      channel: notification.channel.value,
      recipient: notification.recipient,
      subject: notification.subject,
      body: notification.body,
      status: notification.status,
      sentAt: notification.sentAt,
    };
  }
}
