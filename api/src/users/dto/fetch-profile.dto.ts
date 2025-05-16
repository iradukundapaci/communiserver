import { UserRole } from "src/__shared__/enums/user-role.enum";

export namespace FetchProfileDto {
  export class Output {
    id: string;
    names: string;
    email: string;
    activated: boolean;
    role: UserRole;
    phone: string;
    cell: location;
    village: location;
    isibo: location;
    isIsiboLeader: boolean;
    isVillageLeader: boolean;
    isCellLeader: boolean;
  }

  class location {
    id: string;
    name: string;
  }
}
