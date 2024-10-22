import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  /**
   * Default Constructor.
   *
   * */
  constructor(private readonly mailService: MailerService) {}
  async sendMail(mailOptions: {
    to: string;
    message: string;
    subject: string;
  }) {
    const response = await this.mailService.sendMail({
      from: 'no reply <hyperhire_assignment@hyperhire.com>',
      to: mailOptions.to,
      subject: mailOptions.subject,
      text: mailOptions.message,
    });
    return response;
  }
}
