import { EmailProvider } from '../enums/email-provider.enum';
import { SmsProvider } from '../enums/sms-provider.enum';
import { PushProvider } from '../enums/push-provider.enum';

export interface NotificationModuleOptions {
  emailProvider?: EmailProvider;
  smsProvider?: SmsProvider;
  pushProvider?: PushProvider;
}
