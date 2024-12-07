import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserSchema, CreateUserDto } from './users.schema';
import { DuplicateUserError, UserNotFoundError } from './users.errors';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
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
      if (error instanceof UserNotFoundError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }
}
