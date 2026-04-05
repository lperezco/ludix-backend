export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  rolId: number;
  rol: string;
  permissions: string[];
}
