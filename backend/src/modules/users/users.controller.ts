import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserSchema, CreateUserDto } from './users.schema';
import { DuplicateUserError } from './users.errors';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async createUser(@Body() body: unknown): Promise<CreateUserDto> {
    const validated = CreateUserSchema.safeParse(body);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }

    try {
      return await this.usersService.createUser(validated.data);
    } catch (error) {
      if (error instanceof DuplicateUserError) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      const user = await this.usersService.validateUser(
        body.email,
        body.password,
      );
      return this.authService.login(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new BadRequestException('Invalid credentials');
      }
      throw new InternalServerErrorException('Failed to login');
    }
  }
}
