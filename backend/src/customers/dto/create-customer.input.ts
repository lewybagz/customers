import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { CustomerStatus } from '@prisma/client';

@InputType()
export class CreateCustomerInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  company?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field(() => CustomerStatus, { nullable: true })
  @IsEnum(CustomerStatus)
  @IsOptional()
  status?: CustomerStatus;
}
