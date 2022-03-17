import * as sendgrid from '@sendgrid/mail';
import { AttachmentDto, FromDto, MailSettingsDto } from './email.dto';

export async function send(
  from: FromDto,
  to: string | string[],
  subject: string,
  text: string,
  html: string,
  attachments: AttachmentDto[],
  mailSettings: MailSettingsDto,
): Promise<any> {
  try {
    sendgrid.setApiKey(process.env.EMAIL_API_KEY);
    const data: sendgrid.MailDataRequired = {
      to,
      from,
      subject,
      text,
      html,
      attachments,
      mailSettings: { bypassListManagement: { enable: mailSettings.bypassUnsubscriptions } },
    };
    if (mailSettings.hideUnsubscriptionButton) {
      data.trackingSettings = { subscriptionTracking: { enable: false } };
    }
    const response = await sendgrid.send(data);
    const [clientResponse] = response; // the index 0 contains info about the response
    return clientResponse;
  } catch (error) {
    if (error.response && error.response.body && error.response.body.errors) {
      throw new Error(error.response.body.errors[0].message);
    }
    throw new Error(error.message);
  }
}
