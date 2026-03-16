export interface GetNotificationsInput {
  recipient: string;
}

export interface NotificationRecord {
  id: string;
  channel: string;
  recipient: string;
  subject: string;
  body: string;
  status: "pending" | "sent" | "failed";
  sentAt: Date | null;
}

export interface GetNotificationsOutput {
  notifications: NotificationRecord[];
}
