import * as bcrypt from "bcryptjs";

export class PasswordEncryption {
  static hashPassword(password: any) {
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
  }

  static comparePassword(password: string, hash: string) {
    const result = bcrypt.compareSync(password, hash);
    return result;
  }
}
