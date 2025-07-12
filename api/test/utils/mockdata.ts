import "dotenv/config";
import { UserRole } from "src/__shared__/enums/user-role.enum";
import { SignInDto } from "src/auth/dto/sign-in.dto";
import { SignupDto } from "src/auth/dto/sign-up.dto";
import { TokenService } from "src/auth/utils/jwt.util";
import { User } from "src/users/entities/user.entity";
import { PasswordEncryption } from "src/__shared__/utils/password-encrytion.util";

const signUpDto = new SignupDto.Input();
signUpDto.email = "paciexample@gmail.com";
signUpDto.password = "pasS!word123";
signUpDto.names = "Iradukunda Pacifique";
signUpDto.phone = "1234567890";

const signInDto = new SignInDto.Input();
signInDto.email = signUpDto.email;
signInDto.password = signUpDto.password;

// Create specific test user for e2e login
const donorUser = new User(
  "donor@gmail.com",
  "1234567890",
  PasswordEncryption.hashPassword("pasS!word123"),
  UserRole.CITIZEN,
  "Test User",
);

const adminUser = new User(
  "admin@communiserver.rw",
  "123login",
  PasswordEncryption.hashPassword("pasS!word123"),
  UserRole.ADMIN,
  "BACKDOOR ADMIN",
  true,
  true,
  true,
);

const managerUser = new User(
  "manager@gmail.com",
  "1234567890",
  PasswordEncryption.hashPassword("pasS!word123"),
  UserRole.CELL_LEADER,
  "Test User",
);

const supplierUser = new User(
  "supplier@gmail.com",
  "1234567890",
  PasswordEncryption.hashPassword("pasS!word123"),
  UserRole.VOLUNTEER,
  "Test User",
);

const tokenService = new TokenService();

export {
  signUpDto,
  signInDto,
  tokenService,
  donorUser,
  adminUser,
  managerUser,
  supplierUser,
};
