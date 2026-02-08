import { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { ISendEmailPayload } from '@/shared/types/send-email-payload.type';

export class MailerService {
  constructor(
    private readonly client: Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>,
  ) {}

  public async send(payload: ISendEmailPayload) {
    await this.client.sendMail({
      from: 'RESTORE',
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
    });
  }
}
