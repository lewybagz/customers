import { CreateJobInput } from './create-job.input';
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateJobInput extends PartialType(CreateJobInput) {
  @Field(() => ID)
  id: string;
}
