export { NotificationModule } from './src/notification.module';
export { NotificationService } from './src/notification.service';

// Interfaces públicas
export { NotificationPayload, NotificationChannel } from './src/interfaces/notification.interface';
export { NotificationStrategy } from './src/interfaces/notification-strategy.interface';

// Estratégias por canal (caso o usuário deseje sobrescrevê-las ou testá-las)
export { EmailService as EmailNotificationService } from './src/channels/email.service';
export { SmsService as SmsNotificationService } from './src/channels/sms.service';
export { PushService as PushNotificationService } from './src/channels/push.service';
export { SlackService as SlackNotificationService } from './src/channels/slack.service';
