// index.ts

export { NotificationModule } from './src/notification.module';
export { NotificationService } from './src/notification.service';

// Interfaces e Tipos Públicos
export type { NotificationPayload } from './src/interfaces/notification.interface';
export { NotificationChannel } from './src/commons/enums/notification-channel.enum';
export { NotificationStatus } from './src/commons/enums/notification-status.enum';
export type { NotificationModuleOptions } from './src/commons/config/notification-config.interface';
export type { NotificationStrategy } from './src/interfaces/notification-strategy.interface';

// Enums
export { EmailProvider } from './src/commons/enums/email-provider.enum';
export { SmsProvider } from './src/commons/enums/sms-provider.enum';

// Estratégias de canal
export { EmailSengridService as EmailNotificationService } from './src/channels/email/email-sendgrid.service';
export { EmailSesService as SesNotificationService } from './src/channels/email/email-ses.service';

export { SmsTwilioService as SmsNotificationService } from './src/channels/sms/sms-twilio.service';
export { SmsSnsService as SnsNotificationService } from './src/channels/sms/sms-sns.service';

export { PushFirebaseService as PushNotificationService } from './src/channels/push/push-firebase.service';
export { PushOneSignalService as OneSignalNotificationService } from './src/channels/push/push-onesignal.service';

export { SlackService as SlackNotificationService } from './src/channels/slack/slack.service';
