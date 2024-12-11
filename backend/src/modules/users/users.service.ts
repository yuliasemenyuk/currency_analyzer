import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUserDto, UserDto } from './users.schema';
import { DuplicateUserError } from './users.errors';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      return user;
    } catch (error) {
      // if (error instanceof UserNotFoundError) {
      throw error;
      // }
      // throw new Error('Failed to fetch user');
    }
  }

  async createUser(data: AuthUserDto) {
    try {
      const existingUser = await this.findByEmail(data.email);

      if (existingUser) {
        throw new DuplicateUserError(data.email);
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      return await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
        },
      });
    } catch (error) {
      console.log(error);
      // if (error instanceof DuplicateUserError) {
      throw error;
      // }
      // throw new Error('Failed to create user');
    }
  }

  async validateUser(email: string, password: string): Promise<UserDto> {
    try {
      const user = await this.findByEmail(email);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return user;
    } catch (error) {
      // if (error instanceof UnauthorizedException) {
      throw error;
      // }
      // throw new Error('Failed to validate user');
    }
  }
}
