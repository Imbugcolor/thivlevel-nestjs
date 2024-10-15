import { Role } from 'src/user/enum/role.enum';

export interface ClientCache {
  _id: string;
  roles: Role[];
  socketIds: string[];
}
