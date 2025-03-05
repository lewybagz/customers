import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { FirebaseService } from '../config/firebase.config';

@Module({
  providers: [UsersResolver, UsersService, FirebaseService],
  exports: [UsersService],
})
export class UsersModule {}
