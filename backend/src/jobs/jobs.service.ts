import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobInput } from './dto/create-job.input';
import { UpdateJobInput } from './dto/update-job.input';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  create(createJobInput: CreateJobInput) {
    return this.prisma.job.create({
      data: createJobInput,
      include: {
        customer: true,
      },
    });
  }

  findAll() {
    return this.prisma.job.findMany({
      include: {
        customer: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });
  }

  findByCustomer(customerId: string) {
    return this.prisma.job.findMany({
      where: { customerId },
      include: {
        customer: true,
      },
    });
  }

  update(id: string, updateJobInput: UpdateJobInput) {
    return this.prisma.job.update({
      where: { id },
      data: updateJobInput,
      include: {
        customer: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.job.delete({
      where: { id },
    });
  }
}
