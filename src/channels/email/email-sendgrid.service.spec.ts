import { EmailSengridService } from './email-sendgrid.service';
import { NotificationPayload } from '../../interfaces/notification.interface';
import * as sgMail from '@sendgrid/mail';
import { Logger } from '@nestjs/common';

jest.mock('@sendgrid/mail');

describe('EmailSengridService', () => {
  let service: EmailSengridService;
  let mockLogger: Partial<Logger>;

  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SENDGRID_API_KEY: 'dummy-api-key',
      SENDGRID_FROM_EMAIL: 'no-reply@example.com',
    };

    mockLogger = {
      debug: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
    };

    service = new EmailSengridService(mockLogger as Logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = originalEnv;
  });

  it('should send email successfully', async () => {
    const payload: NotificationPayload = {
      to: 'test@example.com',
      subject: 'Test Subject',
      message: 'Plain message',
      htmlMessage: '<strong>HTML message</strong>',
      metadata: {
        traceId: '123456',
      },
    };

    (sgMail.send as jest.Mock).mockResolvedValueOnce(undefined);

    await service.send(payload);

    expect(sgMail.send).toHaveBeenCalledWith({
      to: 'test@example.com',
      from: 'no-reply@example.com',
      subject: 'Test Subject',
      text: 'Plain message',
      html: '<strong>HTML message</strong>',
    });

    expect(mockLogger.debug).toHaveBeenCalled();
    expect(mockLogger.log).toHaveBeenCalledWith(
      `[traceId=123456] Email successfully sent to test@example.com`,
      EmailSengridService.name,
    );
  });

  it('should handle send failure and throw error', async () => {
    const payload: NotificationPayload = {
      to: 'fail@example.com',
      subject: 'Fail Test',
      message: 'Should fail',
      metadata: { traceId: 'trace-error' },
    };

    const errorMock = {
      message: 'Send error',
      response: { body: { error: 'Invalid email' } },
    };

    (sgMail.send as jest.Mock).mockRejectedValueOnce(errorMock);

    await expect(service.send(payload)).rejects.toThrow(
      'SendGrid email failed: Send error',
    );

    expect(mockLogger.error).toHaveBeenCalledWith(
      `[traceId=trace-error] Failed to send email to fail@example.com: ${JSON.stringify(
        errorMock.response.body,
      )}`,
      undefined,
      EmailSengridService.name,
    );
  });

  it('should throw error if API key or FROM email is missing', () => {
    delete process.env.SENDGRID_API_KEY;

    expect(() => new EmailSengridService(mockLogger as Logger)).toThrow(
      'SendGrid API key or FROM email not configured in .env',
    );
  });
});
