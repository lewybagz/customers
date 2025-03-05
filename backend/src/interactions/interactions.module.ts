import { Module } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { InteractionsResolver } from './interactions.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [InteractionsResolver, InteractionsService, PrismaService],
})
export class InteractionsModule {}
