import { validate } from 'class-validator';
import { EmailDto, FromDto, AttachmentDto, MailSettingsDto } from './email.dto';
import { send as sendgridSend } from './sendgrid';
import { plainToClass } from 'class-transformer';
import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import pug from 'pug';
import path from 'path';

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
  protected mailSettings: MailSettingsDto;
  protected messageData: any;
  protected templateFilePath: string;

  constructor(emailDto: EmailDto) {
    this.id = uuid();
    this.app = emailDto.app;
    this.type = emailDto.type;
    this.from = plainToClass(
      FromDto,
      emailDto.from ||
        ({
          name: process.env.FROM_NAME,
          email: process.env.FROM_EMAIL,
        } as FromDto),
    );
    this.to = emailDto.to;
    this.subject = emailDto.subject;
    this.text = emailDto.text;
    this.html = emailDto.html;
    this.attachments = emailDto.attachments;
    this.messageData = emailDto.messageData;
    this.mailSettings = emailDto.mailSettings;
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
    // If custom email
    if (this.type) {
      const compiledFunction = pug.compileFile(
        path.resolve(__dirname, `custom-emails/templates/${this.templateFilePath}`),
      );
      console.log('datos', { ...this.messageData, ...data });
      this.html = compiledFunction({ ...this.messageData, ...data });
    }
  }

  getHTML(): string {
    return this.html;
  }

  async send(): Promise<void> {
    await sendgridSend(
      this.from,
      this.to,
      this.subject,
      this.text,
      this.html || this.text,
      this.attachments,
      this.mailSettings,
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
