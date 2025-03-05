import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { JobStatus, Priority } from '@prisma/client';
import { Customer } from '../../customers/entities/customer.entity';

registerEnumType(JobStatus, {
  name: 'JobStatus',
});

registerEnumType(Priority, {
  name: 'Priority',
});

@ObjectType()
export class Job {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => JobStatus)
  status: JobStatus;

  @Field(() => Priority)
  priority: Priority;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field(() => Customer)
  customer: Customer;

  @Field()
  customerId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
