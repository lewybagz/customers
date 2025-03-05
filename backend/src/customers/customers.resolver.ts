import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';
import { CreateCustomerInput } from './dto/create-customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Customer)
@UseGuards(JwtAuthGuard)
export class CustomersResolver {
  constructor(private readonly customersService: CustomersService) {}

  @Mutation(() => Customer)
  createCustomer(
    @Args('input') createCustomerInput: CreateCustomerInput,
    @CurrentUser() user: any,
  ) {
    return this.customersService.create(createCustomerInput, user.id);
  }

  @Query(() => [Customer], { name: 'customers' })
  findAll(@CurrentUser() user: any) {
    return this.customersService.findAll(user.id);
  }

  @Query(() => Customer, { name: 'customer' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.customersService.findOne(id);
  }

  @Mutation(() => Customer)
  updateCustomer(@Args('input') updateCustomerInput: UpdateCustomerInput) {
    return this.customersService.update(
      updateCustomerInput.id,
      updateCustomerInput,
    );
  }

  @Mutation(() => Customer)
  removeCustomer(@Args('id', { type: () => ID }) id: string) {
    return this.customersService.remove(id);
  }
}
