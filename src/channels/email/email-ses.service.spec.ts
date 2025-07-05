import 'reflect-metadata';
import { EmailSesService } from './email-ses.service';
import { Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { NotificationPayload } from '../../interfaces/notification.interface';

jest.mock('@aws-sdk/client-ses');

describe('EmailSesService', () => {
  const mockLogger = {
    debug: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  const mockSend = jest.fn();
  const mockClient = {
    send: mockSend,
  };

  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...OLD_ENV,
      SES_REGION: 'us-east-1',
      SES_FROM_EMAIL: 'noreply@example.com',
    };
    (SESClient as jest.Mock).mockImplementation(() => mockClient);
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should send email successfully via SES', async () => {
    mockSend.mockResolvedValueOnce({});

    const service = new EmailSesService(mockLogger);
    const payload: NotificationPayload = {
      to: 'john@example.com',
      subject: 'Test Subject',
      message: 'Hello',
      htmlMessage: '<b>Hello</b>',
      metadata: { traceId: '123' },
    };

    await expect(service.send(payload)).resolves.not.toThrow();

    expect(mockSend).toHaveBeenCalledWith(expect.any(SendEmailCommand));
    expect(mockLogger.debug).toHaveBeenCalledWith(
      expect.stringContaining('[traceId=123] Preparing SES email'),
      EmailSesService.name,
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining('[traceId=123] SES email successfully sent'),
      EmailSesService.name,
    );
  });

  it('should log error and throw if SES send fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('SES failure'));

    const service = new EmailSesService(mockLogger);
    const payload: NotificationPayload = {
      to: 'john@example.com',
      subject: 'Failure',
      message: 'Fail',
      metadata: { traceId: 'fail-trace' },
    };

    await expect(service.send(payload)).rejects.toThrow('SES email failed: SES failure');

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('[traceId=fail-trace] Failed to send SES email'),
      expect.any(String),
      EmailSesService.name,
    );
  });

  it('should throw error if config is missing', () => {
    delete process.env.SES_REGION;
    delete process.env.SES_FROM_EMAIL;

    expect(() => new EmailSesService(mockLogger)).toThrow(
      'SES_REGION or SES_FROM_EMAIL not configured in .env',
    );
  });
});
