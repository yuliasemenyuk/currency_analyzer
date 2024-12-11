import { z } from 'zod';

export const AuthUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const UserSchema = AuthUserSchema.extend({
  id: z.string().uuid(),
});

export type AuthUserDto = z.infer<typeof AuthUserSchema>;
export type UserDto = z.infer<typeof UserSchema>;
