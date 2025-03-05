import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job } from './entities/job.entity';
import { CreateJobInput } from './dto/create-job.input';
import { UpdateJobInput } from './dto/update-job.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(() => Job)
@UseGuards(JwtAuthGuard)
export class JobsResolver {
  constructor(private readonly jobsService: JobsService) {}

  @Mutation(() => Job)
  createJob(@Args('input') createJobInput: CreateJobInput) {
    return this.jobsService.create(createJobInput);
  }

  @Query(() => [Job], { name: 'jobs' })
  findAll() {
    return this.jobsService.findAll();
  }

  @Query(() => Job, { name: 'job' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.jobsService.findOne(id);
  }

  @Query(() => [Job], { name: 'customerJobs' })
  findByCustomer(@Args('customerId', { type: () => ID }) customerId: string) {
    return this.jobsService.findByCustomer(customerId);
  }

  @Mutation(() => Job)
  updateJob(@Args('input') updateJobInput: UpdateJobInput) {
    return this.jobsService.update(updateJobInput.id, updateJobInput);
  }

  @Mutation(() => Job)
  removeJob(@Args('id', { type: () => ID }) id: string) {
    return this.jobsService.remove(id);
  }
}
