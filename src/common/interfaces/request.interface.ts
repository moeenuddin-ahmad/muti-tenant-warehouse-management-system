import { Request } from 'express';

export interface UserPayload {
  id: number;
  email: string;
  name?: string;
  role?: string;
  tenant_id?: number;
  status?: string;
  phone?: string;
}

export interface RequestWithUser extends Request {
  user: UserPayload;
}
