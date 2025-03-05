import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class GoogleAuthInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
