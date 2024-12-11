import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthUserSchema, AuthUserDto } from './users.schema';
import { DuplicateUserError, UserNotFoundError } from './users.errors';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async createUser(@Body() body: unknown): Promise<AuthUserDto> {
    const validated = AuthUserSchema.safeParse(body);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors);
    }

    try {
      return await this.usersService.createUser(validated.data);
    } catch (error) {
      if (error instanceof DuplicateUserError) {
        throw new ConflictException(error.message);
      } else if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Post('login')
  async login(@Body() body: unknown): Promise<{ access_token: string }> {
    const validated = AuthUserSchema.safeParse(body);
    if (!validated.success) {
      throw new BadRequestException(validated.error.errors[0].message);
    }
    try {
      const user = await this.usersService.validateUser(
        validated.data.email,
        validated.data.password,
      );
      return this.authService.login(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to login');
    }
  }
}
