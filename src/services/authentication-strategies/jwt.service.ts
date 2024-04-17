import { TokenService } from '@loopback/authentication';
import { injectable, BindingScope } from '@loopback/core';
import { securityId, UserProfile } from '@loopback/security';
import * as jwt from 'jsonwebtoken';

interface CustomUserProfile extends UserProfile {
  username: string;
  email: string;
  role: string;
  // Add other custom properties here
}

@injectable({scope: BindingScope.TRANSIENT})
export class JwtService implements TokenService {
  constructor() {}
  jwtSecret = process.env.SECRET_JWT_KEY ?? 'secret';
  jwtExpirationDays = process.env.JWT_REFRESH_EXPIRATION_DAYS ?? 10;

  async verifyToken(token: string): Promise<UserProfile> {

    if (!token) {
      throw new Error('Error verifying token: token is null');
    }

    let userProfile: CustomUserProfile;
    try {
      const decodedToken = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;
      userProfile = Object.assign(
        {[securityId]: '', username: '', role: '', email: ''},
        {
          [securityId]: decodedToken.id, 
          username: decodedToken.username, // assuming username is the name you want
          email: decodedToken.email,
          role: decodedToken.role
        }
      );
    } catch (error) {
      throw new Error(`Error verifying token: ${error.message}`);
    }

    return userProfile;
  }

  async generateToken(userProfile: CustomUserProfile): Promise<string> {
    if (!userProfile) {
      throw new Error('Error generating token: userProfile is null');
    }

    const userInfoForToken = {
      id: userProfile[securityId],
      username: userProfile.username, // assuming name here is the username
      email: userProfile.email,
      role: userProfile.role
    };

    const expiresIn = this.getExpirationInSeconds();

    try {
      const token = jwt.sign(userInfoForToken, this.jwtSecret, {
        expiresIn: expiresIn,
      });
      return token;
    } catch (error) {
      throw new Error(`Error generating token: ${error.message}`);
    }
  }

  private getExpirationInSeconds(): number {
    const expirationDays = Number(this.jwtExpirationDays);
    if (isNaN(expirationDays)) {
      throw new Error('JWT expiration is not a valid number');
    }
    return expirationDays * 24 * 60 * 60; // convert days to seconds
  }
}
