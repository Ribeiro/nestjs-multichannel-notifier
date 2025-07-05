import { PushOneSignalService } from './push-onesignal.service';
import { Logger } from '@nestjs/common';
import axios from 'axios';
import { NotificationPayload } from '../../interfaces/notification.interface';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PushOneSignalService', () => {
  const logger = {
    debug: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.ONESIGNAL_API_KEY = 'fake-api-key';
    process.env.ONESIGNAL_APP_ID = 'fake-app-id';
    mockedAxios.post.mockReset();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should throw error if env variables are missing', () => {
    delete process.env.ONESIGNAL_API_KEY;
    expect(() => new PushOneSignalService(logger)).toThrow(
      'Missing ONESIGNAL_API_KEY or ONESIGNAL_APP_ID in .env',
    );
  });

  it('should send notification successfully', async () => {
    const service = new PushOneSignalService(logger);

    const payload: NotificationPayload = {
      to: 'user-123',
      subject: 'Test Subject',
      message: 'Test message',
      metadata: { traceId: 'abc123' },
    };

    mockedAxios.post.mockResolvedValue({
      data: { id: 'notif-123' },
      status: 200,
    });

    await service.send(payload);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: 'fake-app-id',
        include_external_user_ids: ['user-123'],
        headings: { en: 'Test Subject' },
        contents: { en: 'Test message' },
        data: { traceId: 'abc123' },
      },
      {
        headers: {
          Authorization: 'Basic fake-api-key',
          'Content-Type': 'application/json',
        },
      },
    );

    expect(logger.debug).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(
      `[traceId=abc123] OneSignal push sent successfully to user-123 | id: notif-123`,
      PushOneSignalService.name,
    );
  });

  it('should handle axios failure and log error', async () => {
    const service = new PushOneSignalService(logger);

    const payload: NotificationPayload = {
      to: 'user-456',
      subject: 'Fail Subject',
      message: 'Fail message',
      metadata: { traceId: 'fail-trace' },
    };

    mockedAxios.post.mockRejectedValue({
      message: 'Request failed',
      response: {
        data: { errors: ['invalid user'] },
      },
      stack: 'error-stack',
    });

    await expect(service.send(payload)).rejects.toThrow(
      'OneSignal push failed: Request failed',
    );

    expect(logger.error).toHaveBeenCalledWith(
      `[traceId=fail-trace] Failed to send OneSignal push to user-456: {"errors":["invalid user"]}`,
      'error-stack',
      PushOneSignalService.name,
    );
  });
});
