import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  username: string;
  iat: number;
  exp: number;
}

export const getUserIdFromToken = (token: string): string => {
  const decoded = jwtDecode<JwtPayload>(token);
  return decoded.sub;
};