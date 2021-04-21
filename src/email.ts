import * as ejs from 'ejs';
import { validate } from 'class-validator';
import { EmailDto, FromDto, AttachmentDto } from './email.dto';
import { send as sendgridSend } from './sendgrid';
import { plainToClass } from 'class-transformer';
import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export class Email {
  public id: string;
  protected app: string;
  protected type: string;
  protected from: FromDto;
  protected to: string | string[];
  protected subject: string;
  protected text: string;
  protected html: string;
  protected attachments: AttachmentDto[];
  protected messageData: any;
  protected templateFilePath: string;

  constructor(emailDto: EmailDto) {
    this.id = uuid();
    this.app = emailDto.app;
    this.type = emailDto.type;
    const from: FromDto = emailDto.from
      ? emailDto.from
      : {
          name: process.env.FROM_NAME,
          email: process.env.FROM_EMAIL,
        };
    this.from = plainToClass(FromDto, emailDto.from || from);
    this.to = emailDto.to;
    this.subject = emailDto.subject;
    this.text = emailDto.text;
    this.html = emailDto.html;
    this.attachments = emailDto.attachments;
    this.messageData = emailDto.messageData;
  }

  async validate(): Promise<void> {
    // validate EmailDto
    const messageErrors = await validate(plainToClass(EmailDto, this));
    if (messageErrors.length > 0) {
      console.error(messageErrors.toString());
      throw new Error(messageErrors.toString());
    }

    // validate EmailDto.messageData according to the instantiated DTO
    if (this.messageData) {
      const messageDataErrors = await validate(this.messageData);
      if (messageDataErrors.length > 0) {
        console.error(messageDataErrors.toString());
        throw new Error(messageDataErrors.toString());
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async buildHtml(data?: any): Promise<void> {
    if (this.type) {
      // If custom email
      this.html = await ejs.renderFile(
        `src/custom-emails/templates/${this.templateFilePath}`,
        {
          ...(data || undefined),
        },
        { async: false },
      );
    }
  }

  async send(): Promise<void> {
    await sendgridSend(
      this.from,
      this.to,
      this.subject,
      this.text,
      this.html || this.text,
      this.attachments,
    );

    if (!process.env.IS_OFFLINE) {
      await dynamodb
        .put({
          TableName: process.env.EMAILS_TABLE_NAME,
          Item: {
            createdAt: new Date().toISOString(),
            ...this,
            html: undefined,
            text: undefined,
            attachments: undefined,
          },
        })
        .promise();
    }
  }
}
