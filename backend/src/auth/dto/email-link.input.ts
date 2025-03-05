import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class EmailLinkInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  emailLink: string;
}
