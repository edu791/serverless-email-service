import {
  IsArray,
  IsBase64,
  isEmail,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  registerDecorator,
  ValidateNested,
  ValidationOptions,
} from 'class-validator';

function IsEmailOrEmailArray(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrEmailArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string | string[]) {
          if (typeof value === 'string') return isEmail(value);
          if (value.length) return value.every((v) => isEmail(v));
          return false;
        },
      },
    });
  };
}
export class FromDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
export class AttachmentDto {
  @IsBase64() content: string;
  @IsString() filename: string;
}
export class EmailDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  app: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  type: string;

  @IsOptional()
  @ValidateNested()
  from: FromDto;

  @IsEmailOrEmailArray()
  to: string | string[];

  @IsString()
  @IsOptional()
  subject: string;

  @IsString()
  @IsOptional()
  text: string;

  @IsString()
  @IsOptional()
  html: string;

  @IsArray()
  @IsOptional()
  attachments: AttachmentDto[] = [];

  @IsObject()
  @IsNotEmpty()
  @IsOptional()
  messageData: any;
}
