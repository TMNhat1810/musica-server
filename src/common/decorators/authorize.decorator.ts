import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums';
import { ROLES_KEY } from '../constants/role';

export const Authorize = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
