import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { UsersService } from '../users/users.service';
// import { User } from './auth.schema';

@Injectable()
export class AuthService {
  constructor(
    // private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(user: any) {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
