import { Injectable, Logger, Inject } from '@nestjs/common';
import { NotificationStrategy } from '../../interfaces/notification-strategy.interface';
import { NotificationPayload } from '../../interfaces/notification.interface';
import {
  SNSClient,
  PublishCommand,
} from '@aws-sdk/client-sns';

@Injectable()
export class SmsSnsService implements NotificationStrategy {
  private readonly snsClient: SNSClient;

  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
  ) {
    const region = process.env.SNS_REGION;

    if (!region) {
      throw new Error('SNS_REGION must be configured in the environment');
    }

    this.snsClient = new SNSClient({ region });
  }

  async send(payload: NotificationPayload): Promise<void> {
    const traceId = payload.metadata?.traceId ?? 'n/a';

    this.logger.debug(
      `[traceId=${traceId}] Preparing SMS via AWS SNS to ${payload.to}`,
      SmsSnsService.name,
    );

    try {
      const command = new PublishCommand({
        Message: payload.message,
        PhoneNumber: payload.to,
      });

      const response = await this.snsClient.send(command);

      this.logger.log(
        `[traceId=${traceId}] SMS sent to ${payload.to} | MessageId: ${response.MessageId}`,
        SmsSnsService.name,
      );
    } catch (error: any) {
      this.logger.error(
        `[traceId=${traceId}] Failed to send SMS to ${payload.to}: ${error.message}`,
        error.stack,
        SmsSnsService.name,
      );
      throw new Error(`AWS SNS SMS delivery failed: ${error.message}`);
    }
  }
}
