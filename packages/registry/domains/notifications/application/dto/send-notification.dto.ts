export interface SendNotificationInput {
  channel: string;
  recipient: string;
  subject: string;
  body: string;
}

export interface SendNotificationOutput {
  notificationId: string;
}
