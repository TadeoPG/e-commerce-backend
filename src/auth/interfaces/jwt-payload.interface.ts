export interface JwtPayload {
  sub: string;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}
