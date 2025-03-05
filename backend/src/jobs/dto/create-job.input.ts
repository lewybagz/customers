import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsEnum, IsOptional, IsDate } from 'class-validator';
import { JobStatus, Priority } from '@prisma/client';
import { Type } from 'class-transformer';

@InputType()
export class CreateJobInput {
  @Field()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => JobStatus, { nullable: true })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @Field(() => Priority, { nullable: true })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @Field({ nullable: true })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;

  @Field()
  @IsString()
  customerId: string;
}
