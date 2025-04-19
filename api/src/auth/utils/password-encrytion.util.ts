import * as bcrypt from "bcryptjs";

/** Password encryption */
export class PasswordEncryption {
  /**
   * Hash password
   * @param password Password to hash
   * @returns password hash
   */
  static hashPassword(password: any) {
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
  }
  /**
   * Compare password with hash
   * @param password Password to compare
   * @param hash Password hash
   * @returns boolean result
   */
  static comparePassword(password: string, hash: string) {
    const result = bcrypt.compareSync(password, hash);
    return result;
  }
}
