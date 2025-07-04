import { Injectable, Logger, Inject } from '@nestjs/common';
import { NotificationStrategy } from '../interfaces/notification-strategy.interface';
import { NotificationPayload } from '../interfaces/notification.interface';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService implements NotificationStrategy {
  private readonly fromEmail: string;

  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
  ) {
    const apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL ?? '';

    if (!apiKey || !this.fromEmail) {
      throw new Error('SendGrid API key or FROM email not configured in .env');
    }

    sgMail.setApiKey(apiKey);
  }

  async send(payload: NotificationPayload): Promise<void> {
    const traceId = payload.metadata?.traceId ?? 'n/a';

    this.logger.debug(
      `[traceId=${traceId}] Preparing SendGrid email to ${payload.to} with subject "${payload.subject}"`,
      EmailService.name,
    );

    const msg = {
      to: payload.to,
      from: this.fromEmail,
      subject: payload.subject ?? 'No subject',
      text: payload.message,
      html: payload.htmlMessage,
    };

    try {
      await sgMail.send(msg);
      this.logger.log(
        `[traceId=${traceId}] Email successfully sent to ${payload.to}`,
        EmailService.name,
      );
    } catch (error: any) {
      const message = error?.response?.body ?? error.message;
      this.logger.error(
        `[traceId=${traceId}] Failed to send email to ${payload.to}: ${JSON.stringify(message)}`,
        error.stack,
        EmailService.name,
      );
      throw new Error(`SendGrid email failed: ${error.message}`);
    }
  }
}
