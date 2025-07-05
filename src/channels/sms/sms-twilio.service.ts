import { Injectable, Logger, Inject } from '@nestjs/common';
import { NotificationStrategy } from '../../interfaces/notification-strategy.interface';
import { NotificationPayload } from '../../interfaces/notification.interface';
import { Twilio } from 'twilio';

@Injectable()
export class SmsTwilioService implements NotificationStrategy {
  private readonly twilioClient: Twilio;
  private readonly fromPhone: string;

  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
  ) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromPhone = process.env.TWILIO_PHONE_NUMBER ?? '';

    if (!accountSid || !authToken || !this.fromPhone) {
      throw new Error('Twilio credentials are not properly configured in .env');
    }

    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async send(payload: NotificationPayload): Promise<void> {
    const traceId = payload.metadata?.traceId ?? 'n/a';

    this.logger.debug(
      `[traceId=${traceId}] Preparing SMS notification to ${payload.to}`,
      SmsTwilioService.name,
    );

    try {
      const message = await this.twilioClient.messages.create({
        to: payload.to,
        from: this.fromPhone,
        body: payload.message,
      });

      this.logger.log(
        `[traceId=${traceId}] SMS sent to ${payload.to} | SID: ${message.sid}`,
        SmsTwilioService.name,
      );
    } catch (error: any) {
      this.logger.error(
        `[traceId=${traceId}] Failed to send SMS to ${payload.to}: ${error.message}`,
        error.stack,
        SmsTwilioService.name,
      );
      throw new Error(`SMS delivery failed: ${error.message}`);
    }
  }
}
