import { UserRole } from "src/__shared__/enums/user-role.enum";

export namespace FetchUserDto {
  export class Output {
    id: string;
    names: string;
    email: string;
    role: UserRole;
    phone: string;
    cell: Location;
    village: Location;
    isibo: Location;
    house: House;
    isIsiboLeader: boolean;
    isVillageLeader: boolean;
    isCellLeader: boolean;
  }

  class Location {
    id: string;
    name: string;
  }

  class House {
    id: string;
    code: string;
    address?: string;
  }
}
