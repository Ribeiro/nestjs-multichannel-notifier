import { Injectable, Logger, Inject } from '@nestjs/common';
import { NotificationStrategy } from '../../interfaces/notification-strategy.interface';
import { NotificationPayload } from '../../interfaces/notification.interface';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailSesService implements NotificationStrategy {
  private readonly sesClient: SESClient;
  private readonly fromEmail: string;

  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
  ) {
    const region = process.env.SES_REGION;
    this.fromEmail = process.env.SES_FROM_EMAIL ?? '';

    if (!region || !this.fromEmail) {
      throw new Error('SES_REGION or SES_FROM_EMAIL not configured in .env');
    }

    this.sesClient = new SESClient({ region });
  }

  async send(payload: NotificationPayload): Promise<void> {
    const traceId = payload.metadata?.traceId ?? 'n/a';

    this.logger.debug(
      `[traceId=${traceId}] Preparing SES email to ${payload.to} with subject "${payload.subject}"`,
      EmailSesService.name,
    );

    const params = {
      Destination: {
        ToAddresses: [payload.to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: payload.htmlMessage ?? `<pre>${payload.message}</pre>`,
          },
          Text: {
            Charset: 'UTF-8',
            Data: payload.message,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: payload.subject ?? 'No subject',
        },
      },
      Source: this.fromEmail,
    };

    try {
      const command = new SendEmailCommand(params);
      await this.sesClient.send(command);
      this.logger.log(
        `[traceId=${traceId}] SES email successfully sent to ${payload.to}`,
        EmailSesService.name,
      );
    } catch (error: any) {
      this.logger.error(
        `[traceId=${traceId}] Failed to send SES email to ${payload.to}: ${error.message}`,
        error.stack,
        EmailSesService.name,
      );
      throw new Error(`SES email failed: ${error.message}`);
    }
  }
}
