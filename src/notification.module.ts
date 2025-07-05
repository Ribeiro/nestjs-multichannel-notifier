import { DynamicModule, Module, Provider } from '@nestjs/common';
import { NotificationService } from './notification.service';

import { SmsTwilioService } from './channels/sms/sms-twilio.service';
import { SmsSnsService } from './channels/sms/sms-sns.service';

import { PushFirebaseService } from './channels/push/push-firebase.service';
import { PushOneSignalService } from './channels/push/push-onesignal.service';

import { SlackService } from './channels/slack/slack.service';

import { EmailSengridService } from './channels/email/email-sendgrid.service';
import { EmailSesService } from './channels/email/email-ses.service';

import { NotificationModuleOptions } from './commons/config/notification-config.interface';
import { EmailProvider } from './commons/enums/email-provider.enum';
import { SmsProvider } from './commons/enums/sms-provider.enum';
import { PushProvider } from './commons/enums/push-provider.enum';

@Module({})
export class NotificationModule {
  static forRoot(options: NotificationModuleOptions): DynamicModule {
    const emailProvider: Provider = {
      provide: 'EMAIL_SERVICE',
      useClass:
        options.emailProvider === EmailProvider.SES
          ? EmailSesService
          : EmailSengridService,
    };

    const smsProvider: Provider = {
      provide: 'SMS_SERVICE',
      useClass:
        options.smsProvider === SmsProvider.SNS
          ? SmsSnsService
          : SmsTwilioService,
    };

    const pushProvider: Provider = {
      provide: 'PUSH_SERVICE',
      useClass:
        options.pushProvider === PushProvider.ONESIGNAL
          ? PushOneSignalService
          : PushFirebaseService,
    };

    return {
      module: NotificationModule,
      providers: [
        emailProvider,
        smsProvider,
        pushProvider,
        {
          provide: 'SLACK_SERVICE',
          useClass: SlackService,
        },
        NotificationService,
        // Exporta para testes externos e substituições
        EmailSengridService,
        EmailSesService,
        SmsTwilioService,
        SmsSnsService,
        PushFirebaseService,
        PushOneSignalService,
        SlackService,
      ],
      exports: [NotificationService],
    };
  }
}
