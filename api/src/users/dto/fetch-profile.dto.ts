import { UserRole } from "src/__shared__/enums/user-role.enum";

export namespace FetchProfileDto {
  export class Output {
    id: string;
    names: string;
    email: string;
    activated: boolean;
    role: UserRole;
    phone: string;
    cell: Location;
    village: Location;
    isibo: Location;
    house: House;
    isIsiboLeader: boolean;
    isVillageLeader: boolean;
    isCellLeader: boolean;
    profileID: string;
  }

  class Location {
    id: string;
    name: string;
  }

  class House {
    id: string;
    code: string;
    street?: string;
  }
}
