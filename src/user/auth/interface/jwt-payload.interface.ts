import { Role } from 'src/user/enum/role.enum';

export interface JwtPayload {
  _id: string;
  role: Role[];
}
