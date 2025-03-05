import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsEnum } from 'class-validator';
import { InteractionType } from '@prisma/client';

@InputType()
export class CreateInteractionInput {
  @Field(() => InteractionType)
  @IsEnum(InteractionType)
  type: InteractionType;

  @Field()
  @IsString()
  notes: string;

  @Field()
  @IsString()
  customerId: string;
}
