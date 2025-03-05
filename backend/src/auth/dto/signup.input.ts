import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, MinLength, IsString } from 'class-validator';

@InputType()
export class SignupInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  password: string;

  @Field()
  @IsString()
  @MinLength(2)
  name: string;
}
