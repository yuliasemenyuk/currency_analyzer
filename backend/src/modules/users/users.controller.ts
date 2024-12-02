import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserSchema, CreateUserDto } from './users.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async loginOrCreateUser(@Body() body: CreateUserDto) {
    const validated = CreateUserSchema.parse(body);
    const user = await this.usersService.findByEmail(validated.email);

    if (user) {
      return user;
    }
    return this.usersService.createUser(validated);
  }
}
