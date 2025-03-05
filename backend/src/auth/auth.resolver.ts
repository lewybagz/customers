import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/login-response';
import { SignupInput } from './dto/signup.input';
import { LoginInput } from './dto/login.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(@Args('loginInput') { email, password }: LoginInput) {
    return this.authService.login(email, password);
  }

  @Mutation(() => LoginResponse)
  async signup(@Args('input') { email, password, name }: SignupInput) {
    return this.authService.signup(email, password, name);
  }
}
