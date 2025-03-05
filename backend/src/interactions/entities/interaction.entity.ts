import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { InteractionType } from '@prisma/client';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';

registerEnumType(InteractionType, {
  name: 'InteractionType',
});

@ObjectType()
export class Interaction {
  @Field(() => ID)
  id: string;

  @Field(() => InteractionType)
  type: InteractionType;

  @Field()
  notes: string;

  @Field(() => Customer)
  customer: Customer;

  @Field()
  customerId: string;

  @Field(() => User)
  createdBy: User;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
