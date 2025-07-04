import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { PushService } from './channels/push.service';
import { SlackService } from './channels/slack.service';

@Module({
  providers: [
    { provide: 'EMAIL_SERVICE', useClass: EmailService },
    { provide: 'SMS_SERVICE', useClass: SmsService },
    { provide: 'PUSH_SERVICE', useClass: PushService },
    { provide: 'SLACK_SERVICE', useClass: SlackService },
    NotificationService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
