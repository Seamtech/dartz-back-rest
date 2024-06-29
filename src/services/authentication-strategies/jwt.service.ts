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
import {Request, HttpErrors, Response} from '@loopback/rest';
import {parseCookies} from '../../utils/cookie-parser';
import {UserRepository, PlayerProfileRepository} from '../../repositories';
import * as bcrypt from 'bcryptjs';
import { UserCredentials } from '../../models';
import { repository } from '@loopback/repository';

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
    this.initializeConfig();
  }

  private initializeConfig(): void {
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
    return this.verify(token, this.jwtSecret);
  }

  async verifyRefreshToken(token: string): Promise<CustomUserProfile> {
    return this.verify(token, this.jwtRefreshSecret);
  }

  private async verify(token: string, secret: string): Promise<CustomUserProfile> {
    if (!token) {
      throw new Error('Token is null');
    }

    const isBlacklisted = await this.tokenBlacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new TokenBlacklistedError();
    }

    try {
      const userProfile = this.getUserProfileFromToken(token, secret);
      return userProfile;
    } catch (error) {
      this.handleTokenError(error);
    }
  }

  async generateToken(userProfile: CustomUserProfile): Promise<string> {
    console.log('Generating token for user:', userProfile)
    return this.generate(userProfile, this.jwtSecret, `${this.jwtExpirationMinutes}m`);
  }

  async generateRefreshToken(userProfile: CustomUserProfile): Promise<string> {
    return this.generate(userProfile, this.jwtRefreshSecret, `${this.jwtRefreshExpirationDays}d`);
  }

  private async generate(userProfile: CustomUserProfile, secret: string, expiresIn: string): Promise<string> {
    if (!userProfile) {
      throw new Error('User profile is null');
    }

    const userInfoForToken = this.extractUserInfo(userProfile);

    try {
      return jwt.sign(userInfoForToken, secret, { expiresIn });
    } catch (error) {
      throw new Error(`Error generating token: ${error.message}`);
    }
  }

  async blacklistToken(token: string): Promise<void> {
    try {
      await this.tokenBlacklistService.addTokenToBlacklist(token);
    } catch (error) {
      throw new Error(`Error blacklisting token: ${error.message}`);
    }
  }

  private getUserProfileFromToken(token: string, secret: string): CustomUserProfile {
    try {
      const decodedToken = jwt.verify(token, secret) as jwt.JwtPayload;
      return this.extractUserProfile(decodedToken);
    } catch (error) {
      throw new Error(`Token decoding failed: ${error.message}`);
    }
  }

  private extractUserInfo(userProfile: CustomUserProfile): object {
    return {
      id: userProfile[securityId],
      username: userProfile.username,
      email: userProfile.email,
      role: userProfile.role,
      profileId: userProfile.profileId,
    };
  }

  private extractUserProfile(decodedToken: jwt.JwtPayload): CustomUserProfile {
    return {
      [securityId]: decodedToken.id,
      username: decodedToken.username,
      email: decodedToken.email,
      role: decodedToken.role,
      profileId: decodedToken.profileId,
    };
  }

  private handleTokenError(error: any): never {
    if (error.name === 'TokenExpiredError') {
      throw new TokenExpiredError();
    } else {
      throw new TokenInvalidError(`Token verification failed: ${error.message}`);
    }
  }

  getUserProfileFromRequest(request: Request): CustomUserProfile {
    const cookies = request.headers.cookie;
    if (!cookies) {
      throw new HttpErrors.Unauthorized('Token not found.');
    }

    const parsedCookies = parseCookies(cookies);
    const token = parsedCookies['accessToken'];

    if (!token) {
      throw new HttpErrors.Unauthorized('Token not found.');
    }

    return this.decodeToken(token);
  }

  private decodeToken(token: string): CustomUserProfile {
    try {
      const decodedToken = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;
      return this.extractUserProfile(decodedToken);
    } catch (error) {
      throw new Error(`Token decoding failed: ${error.message}`);
    }
  }

  async logout(request: Request, response: Response, refreshToken: string): Promise<void> {
    const cookies = request.headers.cookie;
    if (!cookies) {
      throw new HttpErrors.Unauthorized('Token not found.');
    }

    const parsedCookies = parseCookies(cookies);
    const accessToken = parsedCookies['accessToken'];

    if (!accessToken) {
      throw new HttpErrors.Unauthorized('Token not found.');
    }

    try {
      await this.blacklistToken(accessToken);
      await this.blacklistToken(refreshToken);
    } catch (error) {
      // Ignore the error, as we always want to clear the cookie from the client side
    }

    response.clearCookie('accessToken');
  }

  async createTokensAndSetCookie(userProfile: CustomUserProfile, response: Response): Promise<string> {
    try {
      const accessToken = await this.generateToken(userProfile);
      const refreshToken = await this.generateRefreshToken(userProfile);

      response.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      return refreshToken;
    } catch (error) {
      throw new HttpErrors.InternalServerError(`Error generating tokens: ${error.message}`);
    }
  }
}
