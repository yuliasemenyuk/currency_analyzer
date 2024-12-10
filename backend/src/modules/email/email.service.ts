import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendRuleNotification(
    email: string,
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    percentage: number,
    direction: string,
  ): Promise<boolean> {
    try {
      await sgMail.send({
        to: email,
        from: process.env.VERIFIED_SENDER_EMAIL,
        subject: 'Currency Rate Alert',
        text: `Your currency rule has been triggered:
          ${fromCurrency}/${toCurrency} rate has ${direction}d by ${percentage}%
          Current rate: ${rate}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Currency Rate Alert</h2>
            <p>Your currency rule has been triggered:</p>
            <p><strong>${fromCurrency}/${toCurrency}</strong> rate has ${direction}d by ${percentage}%</p>
            <p>Current rate: ${rate}</p>
          </div>
        `,
      });

      this.logger.log(`Notification sent successfully to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Email sending failed: ${(error as Error).message}`);
      return false;
    }
  }
}
