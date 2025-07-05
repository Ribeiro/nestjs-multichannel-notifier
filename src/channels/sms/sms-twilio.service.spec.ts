import { SmsTwilioService } from './sms-twilio.service';
import { NotificationPayload } from '../../interfaces/notification.interface';
import { Logger } from '@nestjs/common';
import { Twilio } from 'twilio';

jest.mock('twilio');

describe('SmsTwilioService', () => {
  let service: SmsTwilioService;
  const mockLogger = {
    debug: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  } as unknown as Logger;

  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...OLD_ENV,
      TWILIO_ACCOUNT_SID: 'test-sid',
      TWILIO_AUTH_TOKEN: 'test-token',
      TWILIO_PHONE_NUMBER: '+123456789',
    };

    const mockTwilio = {
      messages: {
        create: jest.fn().mockResolvedValue({ sid: 'MSG123456' }),
      },
    };

    (Twilio as unknown as jest.Mock).mockImplementation(() => mockTwilio);

    service = new SmsTwilioService(mockLogger);
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  const payload: NotificationPayload = {
    to: '+5511999999999',
    message: 'Test SMS',
    metadata: { traceId: 'trace-123' },
  };

  it('should send SMS successfully', async () => {
    await service.send(payload);

    expect(Twilio).toHaveBeenCalledWith('test-sid', 'test-token');
    expect(mockLogger.debug).toHaveBeenCalledWith(
      `[traceId=trace-123] Preparing SMS notification to +5511999999999`,
      'SmsTwilioService',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      `[traceId=trace-123] SMS sent to +5511999999999 | SID: MSG123456`,
      'SmsTwilioService',
    );
  });

  it('should throw if Twilio fails', async () => {
    const mockTwilio = {
      messages: {
        create: jest.fn().mockRejectedValue(new Error('Twilio error')),
      },
    };

    (Twilio as unknown as jest.Mock).mockImplementation(() => mockTwilio);

    service = new SmsTwilioService(mockLogger);

    await expect(service.send(payload)).rejects.toThrow('SMS delivery failed: Twilio error');

    expect(mockLogger.error).toHaveBeenCalledWith(
      `[traceId=trace-123] Failed to send SMS to +5511999999999: Twilio error`,
      expect.anything(),
      'SmsTwilioService',
    );
  });

  it('should throw if env vars are missing', () => {
    delete process.env.TWILIO_ACCOUNT_SID;

    expect(() => new SmsTwilioService(mockLogger)).toThrow(
      'Twilio credentials are not properly configured in .env',
    );
  });
});
