import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const User = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return null;
    }

    const jwtService = new JwtService({ secret: process.env.JWT_SECRET });
    const decoded = jwtService.decode(token) as { sub: string };
    return { id: decoded.sub };
  },
);
