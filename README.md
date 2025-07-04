# 📣 NestJS Multichannel Notifier

Lib modular para envio de notificações multicanal com NestJS, com suporte completo aos canais:

- 📧 Email via **SendGrid**
- 📱 SMS via **Twilio**
- 🔔 Push via **FCM (Firebase Cloud Messaging v1)** com JWT
- 💬 Slack via **Webhook com emojis e status visual**

---

## 🚀 Instalação

```bash
npm install nestjs-multichannel-notifier
```

## 🔧 Uso Básico

```typescript
@Module({
  imports: [NotificationModule],
})
export class AppModule {
  constructor(private readonly notifier: NotificationService) {
    this.notifier.notify(
      [NotificationChannel.EMAIL, NotificationChannel.SLACK],
      {
        to: 'geovanny@example.com',
        subject: 'Bem-vindo!',
        message: 'Sua conta foi criada com sucesso!',
        htmlMessage: '<h1>Bem-vindo!</h1><p>Conta criada com sucesso</p>',
        metadata: {
          traceId: 'abc-123',
          status: NotificationStatus.SUCCESS,
        },
      },
    );
  }
}
```

## ✅ Canais Suportados

## 📧 Email (SendGrid)

- Configuração .env:

```bash
SENDGRID_API_KEY=SG.xxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

- Suporte a text e htmlMessage

## 📱 SMS (Twilio)

- Configuração .env:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567
```

## 🔔 Push (Firebase FCM HTTP v1)

- Autenticação com Service Account (JWT)
- Configuração .env:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nABC...123\\n-----END PRIVATE KEY-----\\n"
```

## 💬 Slack (Webhook)

- Configuração .env:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
```

- Suporta:
  * Emojis automáticos: ✅, ❌, ⚠️, ℹ️
  * Cores e blocos com status
  * traceId para rastreabilidade

## 🧱 Tipos

* NotificationPayload: estrutura base para todas as notificações
* NotificationStatus: enum com INFO, SUCCESS, WARNING, ERROR, FAIL
* NotificationChannel: enum com EMAIL, SMS, PUSH, SLACK






