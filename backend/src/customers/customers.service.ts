import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerInput } from './dto/create-customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  create(createCustomerInput: CreateCustomerInput, userId: string) {
    return this.prisma.customer.create({
      data: {
        ...createCustomerInput,
        userId,
      },
      include: {
        assignedTo: true,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.customer.findMany({
      where: {
        userId,
      },
      include: {
        assignedTo: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        interactions: true,
        jobs: true,
      },
    });
  }

  update(id: string, updateCustomerInput: UpdateCustomerInput) {
    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerInput,
      include: {
        assignedTo: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
