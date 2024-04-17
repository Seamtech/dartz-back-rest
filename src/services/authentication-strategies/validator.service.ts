import {UserCredentialsWithRelations} from '../../models/User/user-credentials.model'; // Assuming you have a Credentials model

export class ValidatorService {
  static validateCredentials(credentials: UserCredentialsWithRelations) {
    const {email, password} = credentials;

    if (!email || !password) {
      throw new Error('Missing Email or Password');
    }

    // Add additional validation logic as needed, e.g., email format, password strength, etc.
  }
}