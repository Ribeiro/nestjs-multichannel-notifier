import { Injectable, Inject } from '@nestjs/common';
import { NotificationPayload, NotificationChannel } from './interfaces/notification.interface';
import { NotificationStrategy } from './interfaces/notification-strategy.interface';

@Injectable()
export class NotificationService {
  private readonly strategies: Record<NotificationChannel, NotificationStrategy>;

  constructor(
    @Inject('EMAIL_SERVICE') private readonly emailService: NotificationStrategy,
    @Inject('SMS_SERVICE') private readonly smsService: NotificationStrategy,
    @Inject('PUSH_SERVICE') private readonly pushService: NotificationStrategy,
    @Inject('SLACK_SERVICE') private readonly slackService: NotificationStrategy,
  ) {
    this.strategies = {
      email: this.emailService,
      sms: this.smsService,
      push: this.pushService,
      slack: this.slackService,
    };
  }

  async notify(
    channels: NotificationChannel[],
    payload: NotificationPayload,
  ): Promise<void> {
    const promises = channels.map((channel) => {
      const strategy = this.strategies[channel];
      if (!strategy) throw new Error(`Canal de notificação não suportado: ${channel}`);
      return strategy.send(payload);
    });

    await Promise.all(promises);
  }
}
