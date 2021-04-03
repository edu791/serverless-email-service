import * as sendgrid from '@sendgrid/mail';
import { AttachmentDto, FromDto } from './email.dto';

export async function send(
  from: FromDto,
  to: string | string[],
  subject: string,
  text: string,
  html: string,
  attachments: AttachmentDto[],
): Promise<any> {
  try {
    sendgrid.setApiKey(process.env.EMAIL_API_KEY);
    const response = await sendgrid.send({
      to,
      from,
      subject,
      text,
      html,
      attachments,
    });
    const [clientResponse] = response; // the index 0 contains info about the response
    return clientResponse;
  } catch (error) {
    if (error.response && error.response.body && error.response.body.errors) {
      throw new Error(error.response.body.errors[0].message);
    }
    throw new Error(error.message);
  }
}
