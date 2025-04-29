import "dotenv/config";
import { UserRole } from "src/__shared__/enums/user-role.enum";
import { SignInDto } from "src/auth/dto/sign-in.dto";
import { SignupDto } from "src/auth/dto/sign-up.dto";
import { TokenService } from "src/auth/utils/jwt.util";
import { Profile } from "src/users/entities/profile.entity";
import { User } from "src/users/entities/user.entity";
import { SupplierRegDto } from "src/supplier/dto/supplier-reg.dto";
import { PasswordEncryption } from "src/__shared__/utils/password-encrytion.util";

const signUpDto = new SignupDto.Input();
signUpDto.email = "paciexample@gmail.com";
signUpDto.password = "pasS!word123";
signUpDto.names = "Iradukunda Pacifique";
signUpDto.address = "Kg 21st";
signUpDto.phone = "1234567890";

const signInDto = new SignInDto.Input();
signInDto.email = signUpDto.email;
signInDto.password = signUpDto.password;

// Create specific test user for e2e login
const donorUser = new User(
  "donor@gmail.com",
  "Test User",
  PasswordEncryption.hashPassword("pasS!word123"), // Encrypt the password
  UserRole.DONOR,
);
donorUser.activated = true;
donorUser.verifiedAt = new Date();

const adminUser = new User(
  "admin@communiserver.rw",
  "123login",
  PasswordEncryption.hashPassword("pasS!word123"), // Encrypt the password
  UserRole.ADMIN,
);
adminUser.activated = true;
adminUser.verifiedAt = new Date();

const managerUser = new User(
  "manager@gmail.com",
  "Test User",
  PasswordEncryption.hashPassword("pasS!word123"), // Encrypt the password
  UserRole.MANAGER,
);
managerUser.activated = true;
managerUser.verifiedAt = new Date();

const supplierUser = new User(
  "supplier@gmail.com",
  "Test User",
  PasswordEncryption.hashPassword("pasS!word123"), // Encrypt the password
  UserRole.SUPPLIER,
);
supplierUser.activated = true;
supplierUser.verifiedAt = new Date();

// Create and save a profile for the test user
const donorProfile = new Profile("1234567890", "Test Address", donorUser);
const adminProfile = new Profile("1234567890", "Test Address", adminUser);
const supplierProfile = new Profile("1234567890", "Test Address", supplierUser);

donorUser.profile = donorProfile;
adminUser.profile = adminProfile;
supplierUser.profile = supplierProfile;

const supplierDTO = new SupplierRegDto.Input();
supplierDTO.email = "supplier@gmail.com";
supplierDTO.names = "Test User";
supplierDTO.phone = "1234567890";
supplierDTO.address = "Test Address";

const tokenService = new TokenService();

export {
  signUpDto,
  signInDto,
  tokenService,
  donorProfile,
  adminProfile,
  supplierProfile,
  donorUser,
  adminUser,
  managerUser,
  supplierUser,
  supplierDTO,
};
