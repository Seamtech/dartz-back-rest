import {TokenService} from '@loopback/authentication';
import {BindingScope, inject, injectable} from '@loopback/core';
import {UserProfile, securityId} from '@loopback/security';
import * as jwt from 'jsonwebtoken';
import {
  TokenBlacklistedError,
  TokenExpiredError,
  TokenInvalidError,
} from '../../errors/jwt-errors';
import {ConfigurationService} from '../configuration.service';
import {TokenBlacklistService} from './jwt-blacklist.service';
import {CustomUserProfile} from '../../types/user-types';

@injectable({
  scope: BindingScope.TRANSIENT,
})
export class JwtService implements TokenService {
  private jwtSecret: string;
  private jwtExpirationMinutes: number;
  private jwtRefreshSecret: string;
  private jwtRefreshExpirationDays: number;

  constructor(
    @inject('services.ConfigurationService')
    private configService: ConfigurationService,
    @inject('services.TokenBlacklistService')
    private tokenBlacklistService: TokenBlacklistService,
  ) {
    this.jwtSecret = this.configService.get('SECRET_JWT_KEY') ?? 'secret';
    this.jwtExpirationMinutes = parseInt(
      this.configService.get('JWT_EXPIRATION_MINUTES') ?? '15',
      10,
    );
    this.jwtRefreshSecret =
      this.configService.get('SECRET_JWT_REFRESH_KEY') ?? 'refresh_secret';
    this.jwtRefreshExpirationDays = parseInt(
      this.configService.get('JWT_REFRESH_EXPIRATION_DAYS') ?? '7',
      10,
    );
  }

  async verifyToken(token: string): Promise<CustomUserProfile> {
    if (!token) {
      throw new Error('Token is null');
    }

    const isBlacklisted =
      await this.tokenBlacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new TokenBlacklistedError();
    }

    try {
      const userProfile = this.getUserProfileFromToken(token);
      return userProfile;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new TokenExpiredError();
      } else {
        throw new TokenInvalidError(
          `Token verification failed: ${error.message}`,
        );
      }
    }
  }

  async generateToken(userProfile: CustomUserProfile): Promise<string> {
    if (!userProfile) {
      throw new Error('User profile is null');
    }

    const userInfoForToken = {
      id: userProfile[securityId],
      username: userProfile.username,
      email: userProfile.email,
      role: userProfile.role,
      profileId: userProfile.profileId,
    };

    const expiresIn = `${this.jwtExpirationMinutes}m`;

    try {
      const token = jwt.sign(userInfoForToken, this.jwtSecret, {expiresIn});
      return token;
    } catch (error) {
      throw new Error(`Error generating token: ${error.message}`);
    }
  }

  async generateRefreshToken(userProfile: CustomUserProfile): Promise<string> {
    if (!userProfile) {
      throw new Error('User profile is null');
    }

    const userInfoForToken = {
      id: userProfile[securityId],
      username: userProfile.username,
      email: userProfile.email,
      role: userProfile.role,
      profileId: userProfile.profileId,
    };

    const expiresIn = `${this.jwtRefreshExpirationDays}d`;

    try {
      const token = jwt.sign(userInfoForToken, this.jwtRefreshSecret, {
        expiresIn,
      });
      return token;
    } catch (error) {
      throw new Error(`Error generating refresh token: ${error.message}`);
    }
  }

  async verifyRefreshToken(token: string): Promise<CustomUserProfile> {
    if (!token) {
      throw new Error('Refresh token is null');
    }

    const isBlacklisted =
      await this.tokenBlacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new TokenBlacklistedError();
    }

    try {
      const userProfile = this.getUserProfileFromToken(token, true);
      return userProfile;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new TokenExpiredError();
      } else {
        throw new TokenInvalidError(
          `Refresh token verification failed: ${error.message}`,
        );
      }
    }
  }

  async blacklistToken(token: string): Promise<void> {
    try {
      await this.tokenBlacklistService.addTokenToBlacklist(token);
    } catch (error) {
      throw new Error(`Error blacklisting token: ${error.message}`);
    }
  }

  getUserProfileFromToken(token: string, isRefreshToken = false): CustomUserProfile {
    try {
      const secret = isRefreshToken ? this.jwtRefreshSecret : this.jwtSecret;
      const decodedToken = jwt.verify(token, secret) as jwt.JwtPayload;
      const userProfile: CustomUserProfile = {
        [securityId]: decodedToken.id,
        username: decodedToken.username,
        email: decodedToken.email,
        role: decodedToken.role,
        profileId: decodedToken.profileId,
      };
      return userProfile;
    } catch (error) {
      throw new Error(`Token decoding failed: ${error.message}`);
    }
  }
}
