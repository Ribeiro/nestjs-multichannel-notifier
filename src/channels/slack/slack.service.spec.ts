import { SlackService } from './slack.service';
import { NotificationPayload } from '../../interfaces/notification.interface';
import { NotificationStatus } from '../../commons/enums/notification-status.enum';
import axios from 'axios';
import { Logger } from '@nestjs/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SlackService', () => {
  let service: SlackService;
  const mockLogger = {
    debug: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  } as unknown as Logger;

  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, SLACK_WEBHOOK_URL: 'https://slack-webhook.test' };
    service = new SlackService(mockLogger);
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  const payload: NotificationPayload = {
    to: 'slack-channel-id',
    subject: 'Test Notification',
    message: 'This is a test message',
    metadata: {
      traceId: 'test-trace-id',
      status: NotificationStatus.SUCCESS,
    },
  };

  it('should send Slack message successfully', async () => {
    mockedAxios.post.mockResolvedValueOnce({ status: 200 });

    await service.send(payload);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      process.env.SLACK_WEBHOOK_URL,
      expect.objectContaining({
        attachments: expect.any(Array),
      }),
    );

    expect(mockLogger.log).toHaveBeenCalledWith(
      `[traceId=test-trace-id] Slack notification sent to slack-channel-id`,
      SlackService.name,
    );
  });

  it('should throw if SLACK_WEBHOOK_URL is missing', async () => {
    delete process.env.SLACK_WEBHOOK_URL;
    service = new SlackService(mockLogger);

    await expect(service.send(payload)).rejects.toThrow('Missing SLACK_WEBHOOK_URL in .env');

    expect(mockLogger.error).toHaveBeenCalledWith(
      `[traceId=test-trace-id] SLACK_WEBHOOK_URL is not configured in the environment`,
      SlackService.name,
    );
  });

  it('should throw if axios fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Slack API error'));

    await expect(service.send(payload)).rejects.toThrow('Slack notification failed: Slack API error');

    expect(mockLogger.error).toHaveBeenCalledWith(
      `[traceId=test-trace-id] Failed to send Slack notification: Slack API error`,
      expect.anything(),
      SlackService.name,
    );
  });

  it('should use default status mapping if status is missing', async () => {
    const payloadWithoutStatus: NotificationPayload = {
      ...payload,
      metadata: {
        traceId: 'trace-no-status',
      },
    };

    mockedAxios.post.mockResolvedValueOnce({ status: 200 });

    await service.send(payloadWithoutStatus);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        attachments: expect.arrayContaining([
          expect.objectContaining({
            color: SlackService.statusMap[NotificationStatus.INFO].color,
          }),
        ]),
      }),
    );
  });
});
