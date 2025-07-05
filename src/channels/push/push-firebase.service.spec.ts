import { PushFirebaseService } from './push-firebase.service';
import { Logger } from '@nestjs/common';
import { JWT } from 'google-auth-library';
import { NotificationPayload } from '../../interfaces/notification.interface';

jest.mock('google-auth-library', () => {
  return {
    JWT: jest.fn().mockImplementation(() => ({
      authorize: jest.fn(),
      request: jest.fn(),
    })),
  };
});

describe('PushFirebaseService', () => {
  const OLD_ENV = process.env;
  const mockLogger = {
    debug: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  const mockPayload: NotificationPayload = {
    to: 'recipient-token',
    subject: 'Hello',
    message: 'This is a test message',
    metadata: { traceId: 'trace-abc', custom: 'test' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...OLD_ENV,
      FIREBASE_PROJECT_ID: 'test-project',
      FIREBASE_CLIENT_EMAIL: 'test@example.com',
      FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\nABCDEF\n-----END PRIVATE KEY-----',
    };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should send push notification successfully', async () => {
    const jwtMock = new (JWT as any)();
    jwtMock.authorize.mockResolvedValue({});
    jwtMock.request.mockResolvedValue({ status: 200 });

    const service = new PushFirebaseService(mockLogger);
    (service as any).jwtClient = jwtMock;

    await service.send(mockPayload);

    expect(jwtMock.authorize).toHaveBeenCalled();
    expect(jwtMock.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/messages:send'),
        method: 'POST',
        data: expect.any(Object),
      }),
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining('Push notification sent successfully'),
      'PushFirebaseService',
    );
  });

  it('should log and throw if FCM returns error', async () => {
    const jwtMock = new (JWT as any)();
    jwtMock.authorize.mockResolvedValue({});
    jwtMock.request.mockResolvedValue({ status: 500, data: { error: 'Internal Server Error' } });

    const service = new PushFirebaseService(mockLogger);
    (service as any).jwtClient = jwtMock;

    await expect(service.send(mockPayload)).rejects.toThrow(
      'Push notification failed: 500',
    );

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to send push notification'),
      { error: 'Internal Server Error' },
      'PushFirebaseService',
    );
  });

  it('should throw if credentials are missing', () => {
    delete process.env.FIREBASE_PROJECT_ID;

    expect(() => new PushFirebaseService(mockLogger)).toThrow(
      'Missing Firebase credentials in .env',
    );
  });
});
