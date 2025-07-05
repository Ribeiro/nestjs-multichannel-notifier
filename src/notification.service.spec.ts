import { NotificationService } from './notification.service';
import { NotificationStrategy } from './interfaces/notification-strategy.interface';
import { NotificationPayload, NotificationChannel } from './interfaces/notification.interface';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockEmailService: NotificationStrategy;
  let mockSmsService: NotificationStrategy;
  let mockPushService: NotificationStrategy;
  let mockSlackService: NotificationStrategy;

  const payload: NotificationPayload = {
    to: 'user@example.com',
    subject: 'Test Subject',
    message: 'Test Message',
    metadata: { traceId: 'abc123' },
  };

  beforeEach(() => {
    mockEmailService = { send: jest.fn().mockResolvedValue(undefined) };
    mockSmsService = { send: jest.fn().mockResolvedValue(undefined) };
    mockPushService = { send: jest.fn().mockResolvedValue(undefined) };
    mockSlackService = { send: jest.fn().mockResolvedValue(undefined) };

    service = new NotificationService(
      mockEmailService,
      mockSmsService,
      mockPushService,
      mockSlackService,
    );
  });

  it('should notify all provided channels', async () => {
    await service.notify([NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.PUSH, NotificationChannel.SLACK], payload);

    expect(mockEmailService.send).toHaveBeenCalledWith(payload);
    expect(mockSmsService.send).toHaveBeenCalledWith(payload);
    expect(mockPushService.send).toHaveBeenCalledWith(payload);
    expect(mockSlackService.send).toHaveBeenCalledWith(payload);
  });

  it('should notify only selected channels', async () => {
    await service.notify([NotificationChannel.EMAIL, NotificationChannel.SLACK], payload);

    expect(mockEmailService.send).toHaveBeenCalledWith(payload);
    expect(mockSlackService.send).toHaveBeenCalledWith(payload);
    expect(mockSmsService.send).not.toHaveBeenCalled();
    expect(mockPushService.send).not.toHaveBeenCalled();
  });

  it('should throw an error for unsupported channel', async () => {
    const invalidChannel = 'invalid' as NotificationChannel;

    await expect(service.notify([invalidChannel], payload)).rejects.toThrow(
      'Unsupported Notification Channel: invalid',
    );
  });
});
