import { plainToClass } from 'class-transformer';
import { EmailDto } from '../../email.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { Email } from '../../email';

class WelcomeDto {
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
}

export class WelcomeEmail extends Email {
  constructor(messageDataDto: EmailDto) {
    super(messageDataDto);
    this.subject = 'Thank you for registering on the website!';
    this.messageData = plainToClass(WelcomeDto, this.messageData);
    this.templateFilePath = `webapp/${this.type}.html`;
  }
}
