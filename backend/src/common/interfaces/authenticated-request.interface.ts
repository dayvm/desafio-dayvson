import { Request } from 'express';

// Definimos o que tem dentro do token
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Estendemos o Request do Express para sempre ter o user
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}