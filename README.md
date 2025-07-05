# 📣 NestJS Multichannel Notifier

Biblioteca modular para envio de notificações multicanal com NestJS.

Suporte completo aos canais:
- 📧 **Email**: SendGrid ou AWS SES
- 📱 **SMS**: Twilio ou AWS SNS
- 🔔 **Push Notification**: Firebase FCM ou OneSignal
- 💬 **Slack**: Webhook personalizado

---

## 🚀 Instalação

```bash
npm install nestjs-multichannel-notifier
```

## 🔧 Uso Básico

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import {
  NotificationModule,
  EmailProvider,
  SmsProvider,
} from 'nestjs-multichannel-notifier';

@Module({
  imports: [
    NotificationModule.forRoot({
      emailProvider: EmailProvider.SES,
      smsProvider: SmsProvider.TWILIO,
    }),
  ],
})
export class AppModule {}
```