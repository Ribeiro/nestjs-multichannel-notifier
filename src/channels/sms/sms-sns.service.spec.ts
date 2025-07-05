import { SmsSnsService } from './sms-sns.service';
import { Logger } from '@nestjs/common';
import { SNSClient } from '@aws-sdk/client-sns';
import { NotificationPayload } from '../../interfaces/notification.interface';

jest.mock('@aws-sdk/client-sns');

describe('SmsSnsService', () => {
  const mockLogger = {
    debug: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...OLD_ENV,
      SNS_REGION: 'us-east-1',
    };

    (SNSClient as jest.Mock).mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({ MessageId: 'mocked-message-id' }),
    }));
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  const payload: NotificationPayload = {
    to: '+5511999999999',
    message: 'Test SMS',
    metadata: { traceId: 'trace-123' },
  };

  it('should send SMS successfully via SNS', async () => {
    const service = new SmsSnsService(mockLogger);
    await service.send(payload);

    expect(SNSClient).toHaveBeenCalledWith({ region: 'us-east-1' });

    expect(mockLogger.debug).toHaveBeenCalledWith(
      `[traceId=trace-123] Preparing SMS via AWS SNS to +5511999999999`,
      'SmsSnsService',
    );

    expect(mockLogger.log).toHaveBeenCalledWith(
      `[traceId=trace-123] SMS sent to +5511999999999 | MessageId: mocked-message-id`,
      'SmsSnsService',
    );
  });

  it('should log and throw error if sending fails', async () => {
    const error = new Error('SNS error');
    (SNSClient as jest.Mock).mockImplementation(() => ({
      send: jest.fn().mockRejectedValue(error),
    }));

    const service = new SmsSnsService(mockLogger);

    await expect(service.send(payload)).rejects.toThrow(
      'AWS SNS SMS delivery failed: SNS error',
    );

    expect(mockLogger.error).toHaveBeenCalledWith(
      `[traceId=trace-123] Failed to send SMS to +5511999999999: SNS error`,
      error.stack,
      'SmsSnsService',
    );
  });

  it('should throw if SNS_REGION is not configured', () => {
    delete process.env.SNS_REGION;

    expect(() => new SmsSnsService(mockLogger)).toThrow(
      'SNS_REGION must be configured in the environment',
    );
  });
});
