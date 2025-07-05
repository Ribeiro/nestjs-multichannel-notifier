import * as NotificationLib from '../index';

describe('📦 NotificationLib Public API Exports', () => {
  it('should export NotificationModule', () => {
    expect(NotificationLib.NotificationModule).toBeDefined();
  });

  it('should export NotificationService', () => {
    expect(NotificationLib.NotificationService).toBeDefined();
  });

  it('should export NotificationChannel enum', () => {
    expect(NotificationLib.NotificationChannel).toBeDefined();
  });

  it('should export NotificationStatus enum', () => {
    expect(NotificationLib.NotificationStatus).toBeDefined();
  });

  it('should export EmailProvider and SmsProvider enums', () => {
    expect(NotificationLib.EmailProvider).toBeDefined();
    expect(NotificationLib.SmsProvider).toBeDefined();
  });

  it('should export email notification services', () => {
    expect(NotificationLib.EmailNotificationService).toBeDefined();
    expect(NotificationLib.SesNotificationService).toBeDefined();
  });

  it('should export SMS notification services', () => {
    expect(NotificationLib.SmsNotificationService).toBeDefined();
    expect(NotificationLib.SnsNotificationService).toBeDefined();
  });

  it('should export Push notification services', () => {
    expect(NotificationLib.PushNotificationService).toBeDefined();
    expect(NotificationLib.OneSignalNotificationService).toBeDefined();
  });

  it('should export SlackNotificationService', () => {
    expect(NotificationLib.SlackNotificationService).toBeDefined();
  });
});
