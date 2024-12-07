import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from './users.schema';
import { DuplicateUserError, UserNotFoundError } from './users.errors';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UserNotFoundError(email);
      }

      return user;
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch user');
    }
  }

  async createUser(data: CreateUserDto) {
    try {
      const existingUser = await this.findByEmail(data.email);

      if (existingUser) {
        throw new DuplicateUserError(data.email);
      }

      return await this.prisma.user.create({
        data: {
          email: data.email,
        },
      });
    } catch (error) {
      if (error instanceof DuplicateUserError) {
        throw error;
      }
      throw new Error('Failed to create user');
    }
  }
}
