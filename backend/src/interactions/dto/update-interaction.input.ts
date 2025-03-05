import { CreateInteractionInput } from './create-interaction.input';
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateInteractionInput extends PartialType(
  CreateInteractionInput,
) {
  @Field(() => ID)
  id: string;
}
