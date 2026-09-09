import { Request } from 'express';
import { SystemRole } from '@prisma/client';

export interface UserPayload {
  userId: string;
  email: string;
  role: SystemRole;
  organizationId: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user: UserPayload;
}
