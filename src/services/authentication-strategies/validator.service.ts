import { UserCredentialsWithRelations } from '../../models/User/user-credentials.model';

export class ValidatorService {
  static validateCredentials(credentials: UserCredentialsWithRelations): void {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new Error('Missing Email or Password');
    }

    if (!ValidatorService.isValidEmail(email)) {
      throw new Error('Invalid Email format');
    }

    if (!ValidatorService.isStrongPassword(password)) {
      throw new Error('Password does not meet strength requirements');
    }
  }

  private static isValidEmail(email: string): boolean {
    // Implement email validation logic
    return true;
  }

  private static isStrongPassword(password: string): boolean {
    // Implement password strength validation logic
    return true;
  }
}
