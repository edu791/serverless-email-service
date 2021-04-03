import 'source-map-support/register';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { plainToClass } from 'class-transformer';
import { Email } from './email';
import { EmailDto } from './email.dto';
import { getCustomEmailClass } from './custom-emails';

export const sendEmail: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body);
  console.info('Received data => ', JSON.stringify(body, null, 2));
  const data = plainToClass(EmailDto, body);

  let email = new Email(data);

  try {
    if (data.type) {
      const customEmailClass = getCustomEmailClass(data.app, data.type);
      email = new customEmailClass(data);
    }

    await email.validate();
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }

  try {
    await email.buildHtml();
    await email.send();
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Email sent',
      emailId: email.id,
    }),
  };
};
