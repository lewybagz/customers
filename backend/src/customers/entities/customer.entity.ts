import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { CustomerStatus } from '@prisma/client';
import { User } from '../../users/entities/user.entity';

registerEnumType(CustomerStatus, {
  name: 'CustomerStatus',
});

@ObjectType()
export class Customer {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  company?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => CustomerStatus)
  status: CustomerStatus;

  @Field(() => User)
  assignedTo: User;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
