import { Injectable, Logger } from '@nestjs/common';
import { NotificationStrategy } from '../interfaces/notification-strategy.interface';
import { NotificationPayload } from '../interfaces/notification.interface';
import { NotificationStatus } from '../interfaces/notification-status.enum';
import axios from 'axios';

@Injectable()
export class SlackService implements NotificationStrategy {
  constructor(private readonly logger: Logger) {}

  static readonly statusMap: Record<NotificationStatus, { emoji: string; color: string }> = {
    [NotificationStatus.INFO]: { emoji: 'ℹ️', color: '#439FE0' },
    [NotificationStatus.SUCCESS]: { emoji: '✅', color: '#36A64F' },
    [NotificationStatus.WARNING]: { emoji: '⚠️', color: '#FFCC00' },
    [NotificationStatus.ERROR]: { emoji: '❌', color: '#E01E5A' },
    [NotificationStatus.FAIL]: { emoji: '❌', color: '#E01E5A' },
  };

  async send(payload: NotificationPayload): Promise<void> {
    const traceId = payload.metadata?.traceId ?? 'n/a';
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    this.logger.debug(
      `[traceId=${traceId}] Preparing Slack notification to ${payload.to} with subject "${payload.subject}"`,
      SlackService.name,
    );

    if (!webhookUrl) {
      this.logger.error(`[traceId=${traceId}] SLACK_WEBHOOK_URL is not configured in the environment`, SlackService.name);
      throw new Error('Missing SLACK_WEBHOOK_URL in .env');
    }

    const status = payload.metadata?.status ?? NotificationStatus.INFO;
    const { emoji, color } = SlackService.statusMap[status] ?? SlackService.statusMap[NotificationStatus.INFO];

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${emoji} *${payload.subject || 'Notification'}*`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: payload.message,
        },
      },
      ...(traceId !== 'n/a'
        ? [
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `Trace ID: \`${traceId}\``,
                },
              ],
            },
          ]
        : []),
    ];

    const body = {
      attachments: [
        {
          color,
          blocks,
        },
      ],
    };

    try {
      await axios.post(webhookUrl, body);
      this.logger.log(`[traceId=${traceId}] Slack notification sent to ${payload.to}`, SlackService.name);
    } catch (error: any) {
      this.logger.error(
        `[traceId=${traceId}] Failed to send Slack notification: ${error.message}`,
        error.stack,
        SlackService.name,
      );
      throw new Error(`Slack notification failed: ${error.message}`);
    }
  }
}
