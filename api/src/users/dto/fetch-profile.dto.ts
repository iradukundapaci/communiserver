import { UserRole } from "src/__shared__/enums/user-role.enum";

export namespace FetchProfileDto {
  export class Output {
    names: string;
    email: string;
    activated: boolean;
    role: UserRole;
    phone: string;
    cell: string;
    village: string;
    isVillageLeader: boolean;
    isCellLeader: boolean;
  }
}
