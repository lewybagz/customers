import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInteractionInput } from './dto/create-interaction.input';
import { UpdateInteractionInput } from './dto/update-interaction.input';

@Injectable()
export class InteractionsService {
  constructor(private prisma: PrismaService) {}

  create(createInteractionInput: CreateInteractionInput, userId: string) {
    return this.prisma.interaction.create({
      data: {
        ...createInteractionInput,
        userId,
      },
      include: {
        customer: true,
        createdBy: true,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.interaction.findMany({
      where: {
        userId,
      },
      include: {
        customer: true,
        createdBy: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.interaction.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: true,
      },
    });
  }

  findByCustomer(customerId: string) {
    return this.prisma.interaction.findMany({
      where: { customerId },
      include: {
        customer: true,
        createdBy: true,
      },
    });
  }

  update(id: string, updateInteractionInput: UpdateInteractionInput) {
    return this.prisma.interaction.update({
      where: { id },
      data: updateInteractionInput,
      include: {
        customer: true,
        createdBy: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.interaction.delete({
      where: { id },
    });
  }
}
