import bcrypt from "bcrypt";
export default class bcryptService {
  static async hashPassword(password: string) {
    const saltRounds = 10;
    const genSalt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, genSalt);
    return hashedPassword;
  }

  static async comparePassword(password: string, hashedPassword: string) {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }
}
