import { UserCredentialsWithRelations } from '../../models/User/user-credentials.model';

export class ValidatorService {
  static validateCredentials(credentials: UserCredentialsWithRelations): void {
    const { emailOrUsername, password } = credentials;

    if (!emailOrUsername || !password) {
      throw new Error('Missing Email/Username or Password');
    }

    if (!ValidatorService.isValidEmailOrUsername(emailOrUsername)) {
      throw new Error('Invalid Email/Username format');
    }

    if (!ValidatorService.isStrongPassword(password)) {
      throw new Error('Password does not meet strength requirements');
    }
  }

  private static isValidEmailOrUsername(emailOrUsername: string): boolean {
    // Simple email regex for demonstration purposes
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Simple username regex (alphanumeric and underscores, 3-16 characters)
    const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;

    return emailRegex.test(emailOrUsername) || usernameRegex.test(emailOrUsername);
  }

  private static isStrongPassword(password: string): boolean {
    // Example password strength validation
    //const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    //return strongPasswordRegex.test(password);
    return password.length >= 6;
  }
}
