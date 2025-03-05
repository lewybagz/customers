import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { Interaction } from './entities/interaction.entity';
import { CreateInteractionInput } from './dto/create-interaction.input';
import { UpdateInteractionInput } from './dto/update-interaction.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Interaction)
@UseGuards(JwtAuthGuard)
export class InteractionsResolver {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Mutation(() => Interaction)
  createInteraction(
    @Args('input') createInteractionInput: CreateInteractionInput,
    @CurrentUser() user: any,
  ) {
    return this.interactionsService.create(createInteractionInput, user.id);
  }

  @Query(() => [Interaction], { name: 'interactions' })
  findAll(@CurrentUser() user: any) {
    return this.interactionsService.findAll(user.id);
  }

  @Query(() => Interaction, { name: 'interaction' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.interactionsService.findOne(id);
  }

  @Query(() => [Interaction], { name: 'customerInteractions' })
  findByCustomer(@Args('customerId', { type: () => ID }) customerId: string) {
    return this.interactionsService.findByCustomer(customerId);
  }

  @Mutation(() => Interaction)
  updateInteraction(
    @Args('input') updateInteractionInput: UpdateInteractionInput,
  ) {
    return this.interactionsService.update(
      updateInteractionInput.id,
      updateInteractionInput,
    );
  }

  @Mutation(() => Interaction)
  removeInteraction(@Args('id', { type: () => ID }) id: string) {
    return this.interactionsService.remove(id);
  }
}
