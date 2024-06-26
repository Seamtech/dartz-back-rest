import { Getter, inject, intercept, InvocationContext } from '@loopback/core';
import { juggler, repository } from '@loopback/repository';
import { HttpErrors, Request, Response, RestBindings, get, getModelSchemaRef, post, patch, requestBody, response } from '@loopback/rest';
import { SecurityBindings, securityId } from '@loopback/security';
import * as bcrypt from 'bcryptjs';
import { UserCredentials, PlayerProfile, UserSignup, User } from '../models';
import { PlayerProfileRepository, UserRepository } from '../repositories';
import { JwtService } from '../services/authentication-strategies/jwt.service';
import { CustomUserProfile } from '../types';
import { parseCookies } from '../utils/cookie-parser';
import { PlayerAverageStatisticsRepository, PlayerStatisticsRepository } from '../repositories/Player';
import { ValidatorService } from '../services/authentication-strategies/validator.service';

const USER_PROFILE_KEY = 'userProfile';

export class AuthController {
  constructor(
    @repository(UserRepository) private usersRepository: UserRepository,
    @repository(PlayerProfileRepository) private playerProfileRepository: PlayerProfileRepository,
    @repository(PlayerStatisticsRepository) private playerStatisticsRepository: PlayerStatisticsRepository,
    @repository(PlayerAverageStatisticsRepository) private playerAverageStatisticsRepository: PlayerAverageStatisticsRepository,
    @inject('services.JwtService') private tokenService: JwtService,
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
    @inject.context() private context: InvocationContext, // Injecting context
  ) {}

  private async createTokensAndSetCookie(userProfile: CustomUserProfile): Promise<string> {
    try {
      const accessToken = await this.tokenService.generateToken(userProfile);
      const refreshToken = await this.tokenService.generateRefreshToken(userProfile);

      this.response.cookie('accessToken', accessToken, {
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

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async validateUserCredentials(credentials: UserCredentials): Promise<CustomUserProfile> {
    const user = await this.usersRepository.findOne({
      where: { or: [{ email: credentials.emailOrUsername }, { username: credentials.emailOrUsername }] },
    });

    if (!user) {
      throw new HttpErrors.Unauthorized('Invalid email/username or password.');
    }

    const passwordIsValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!passwordIsValid) {
      throw new HttpErrors.Unauthorized('Invalid email/username or password.');
    }

    const playerProfile = await this.playerProfileRepository.findOne({
      where: { userId: user.id },
    });

    if (!playerProfile) {
      throw new HttpErrors.Unauthorized('User profile not found.');
    }

    return {
      [securityId]: user.id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      profileId: playerProfile.id,
    };
  }

  @post('/signup')
  @response(200, {
    description: 'User Signup',
    content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } },
  })
  async signup(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserSignup, { title: 'NewUser' }),
        },
      },
    }) newUserRequest: UserSignup,
  ): Promise<{ message: string }> {
    const db: juggler.DataSource = this.usersRepository.dataSource;
    const transaction = await db.beginTransaction({ isolationLevel: 'READ COMMITTED' || undefined });

    try {
      const hashedPassword = await this.hashPassword(newUserRequest.password);
      const savedUser = await this.usersRepository.create({
        passwordHash: hashedPassword,
        role: '1',
        email: newUserRequest.email,
        username: newUserRequest.username,
      }, { transaction });

      await this.playerProfileRepository.create({
        userId: savedUser.id,
        username: newUserRequest.username,
        email: newUserRequest.email,
        firstName: newUserRequest.firstName,
        lastName: newUserRequest.lastName,
        mobileNumber: newUserRequest.mobileNumber ?? '',
        address1: newUserRequest.address1,
        address2: newUserRequest.address2 ?? null,
        city: newUserRequest.city,
        state: newUserRequest.state,
        zip: newUserRequest.zip,
        bsLiveCode: newUserRequest.bsLiveCode ?? '',
        defaultLocation: newUserRequest.location ?? null,
      }, { transaction });

      await transaction.commit();
      return { message: 'Signup successful. Please log in.' };
    } catch (error) {
      await transaction.rollback();
      if (error.code === '23505') { // Unique constraint violation code for PostgreSQL
        if (error.detail.includes('email')) {
          throw new HttpErrors.Conflict('Email already exists.');
        }
        if (error.detail.includes('username')) {
          throw new HttpErrors.Conflict('Username already exists.');
        }
      }
      throw new HttpErrors.InternalServerError(`Error during signup: ${error.message}`);
    }
  }

  @post('/login')
  @response(200, {
    description: 'User Login',
    content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } } },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              emailOrUsername: { type: 'string' },
              password: { type: 'string' },
            },
            required: ['emailOrUsername', 'password'],
          },
        },
      },
    }) credentials: UserCredentials,
  ): Promise<{ refreshToken: string }> {
    ValidatorService.validateCredentials(credentials); // Validate credentials
    const userProfile = await this.validateUserCredentials(credentials);
    const refreshToken = await this.createTokensAndSetCookie(userProfile);
    return { refreshToken };
  }

  @post('/refresh-token')
  @response(200, {
    description: 'Refresh Token',
    content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } } },
  })
  async refreshToken(
    @requestBody({
      content: {
        'application/json': {
          schema: { type: 'object', properties: { refreshToken: { type: 'string' } } },
        },
      },
    }) body: { refreshToken: string },
  ): Promise<{ refreshToken: string }> {
    try {
      const userProfile = await this.tokenService.verifyRefreshToken(body.refreshToken);
      const newRefreshToken = await this.createTokensAndSetCookie(userProfile);
      return { refreshToken: newRefreshToken };
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error refreshing token: ${error.message}`);
    }
  }

  @post('/logout')
  @response(200, {
    description: 'User Logout',
    content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } },
  })
  async logout(
    @requestBody({
      content: {
        'application/json': {
          schema: { type: 'object', properties: { refreshToken: { type: 'string' } } },
        },
      },
    }) body: { refreshToken: string },
  ): Promise<{ message: string }> {
    const accessToken = this.getTokenFromCookie();
    if (!accessToken) {
      throw new HttpErrors.Unauthorized('Token not found.');
    }

    try {
      if (accessToken) {
        await this.tokenService.blacklistToken(accessToken);
      }
      if (body.refreshToken) {
        await this.tokenService.blacklistToken(body.refreshToken);
      }
      this.response.clearCookie('accessToken');
    } catch (error) {
      throw new HttpErrors.InternalServerError(`Error during logout: ${error.message}`);
    }

    return { message: 'Logout successful' };
  }

  @intercept('interceptors.TokenAuthorizationInterceptor')
  @post('/change-password')
  @response(200, {
    description: 'Change Password',
    content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } },
  })
  async changePassword(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              currentPassword: { type: 'string', minLength: 6 },
              newPassword: { type: 'string', minLength: 6 },
            },
            required: ['currentPassword', 'newPassword'],
          },
        },
      },
    },
  ) passwordData: { currentPassword: string; newPassword: string },
  ): Promise<{ message: string }> {
    const token = this.getTokenFromCookie();
    if (!token) {
      throw new HttpErrors.Unauthorized('Token not found.');
    }

    const userProfile = this.tokenService.getUserProfileFromToken(token);
    const userId = Number(userProfile[securityId]); // Assuming the user's ID is accessible from the userProfile

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new HttpErrors.NotFound('User not found.');
    }

    const passwordIsValid = await bcrypt.compare(passwordData.currentPassword, user.passwordHash);
    if (!passwordIsValid) {
      throw new HttpErrors.Unauthorized('Current password is incorrect.');
    }

    const hashedNewPassword = await this.hashPassword(passwordData.newPassword);
    await this.usersRepository.updateById(userId, { passwordHash: hashedNewPassword });

    return { message: 'Password changed successfully.' };
  }

  @intercept('interceptors.TokenAuthorizationInterceptor')
  @get('/my-account', {
    responses: {
      '200': {
        description: 'My Account',
        content: { 'application/json': { schema: { 'x-ts-type': PlayerProfile } } },
      },
    },
  })
  async getMyProfile(): Promise<any> {
    const token = this.getTokenFromCookie();
    if (!token) {
      throw new HttpErrors.Unauthorized('Token not found.');
    }

    const userProfile = this.tokenService.getUserProfileFromToken(token);
    const userId = Number(userProfile[securityId]);
    try {
      const profile = await this.playerProfileRepository.findOne({
        where: { userId },
        include: [
          {
            relation: 'playerStatistics',
            scope: {
              fields: {
                id: false, profileId: false, // Exclude 'id' and 'profileId'
              }
            }
          },
          {
            relation: 'playerAverageStatistics',
            scope: {
              fields: {
                id: false, profileId: false, // Exclude 'id' and 'profileId'
              }
            }
          },
        ],
      });

      if (!profile) {
        throw new HttpErrors.NotFound('User profile not found');
      }

      // Flatten the profile by overwriting sub-object properties
      const flatProfile: Partial<PlayerProfile> = {
        ...profile,
        ...profile.playerStatistics,
        ...profile.playerAverageStatistics,
      };

      // Remove nested objects
      delete flatProfile.playerStatistics;
      delete flatProfile.playerAverageStatistics;

      console.log('Flat profile:', flatProfile);
      return flatProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new HttpErrors.InternalServerError('Error fetching user profile');
    }
  }

  @intercept('interceptors.TokenAuthorizationInterceptor')
  @patch('/edit-profile', {
    responses: {
      '204': {
        description: 'Profile updated successfully',
      },
      '400': {
        description: 'Invalid input data',
      },
      '401': {
        description: 'Unauthorized',
      },
      '404': {
        description: 'Profile not found',
      },
      '409': {
        description: 'Conflict',
      },
      '500': {
        description: 'Internal server error',
      },
    },
  })
  async editProfile(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PlayerProfile, { partial: true }),
        },
      },
    }) profileData: Partial<PlayerProfile>,
  ): Promise<void> {
    const token = this.getTokenFromCookie();
    if (!token) {
      throw new HttpErrors.Unauthorized('Token not found.');
    }
  
    const userProfile = this.tokenService.getUserProfileFromToken(token);
    const userId = Number(userProfile[securityId]);
  
    const db: juggler.DataSource = this.usersRepository.dataSource;
    const transaction = await db.beginTransaction({ isolationLevel: 'READ COMMITTED' || undefined });
  
    try {
      const existingProfile = await this.playerProfileRepository.findOne({ where: { userId } });
      if (!existingProfile) {
        throw new HttpErrors.NotFound('User profile not found.');
      }
  
      // Update user table if email or username are provided
      if (profileData.email || profileData.username) {
        const userUpdates: Partial<User> = {};
        if (profileData.email) userUpdates.email = profileData.email;
        if (profileData.username) userUpdates.username = profileData.username;
  
        await this.usersRepository.updateById(userId, userUpdates, { transaction });
      }
  
      // Update player profile
      await this.playerProfileRepository.updateById(existingProfile.id, profileData, { transaction });
  
      await transaction.commit();
  
      this.response.status(204).send();
    } catch (error) {
      await transaction.rollback();
      if (error.code === '23505') { // Unique constraint violation code for PostgreSQL
        if (error.detail.includes('email')) {
          throw new HttpErrors.Conflict('Email already exists.');
        }
        if (error.detail.includes('username')) {
          throw new HttpErrors.Conflict('Username already exists.');
        }
        if (error.detail.includes('bsLiveCode')) {
          throw new HttpErrors.Conflict('Bullshooter code already exists.');
        }
      }
      if (error instanceof HttpErrors.HttpError) {
        throw error;
      }
      console.error('Error updating profile:', error);
      throw new HttpErrors.InternalServerError('Error updating profile');
    }
  }

  private getTokenFromCookie(): string | undefined {
    const cookies = this.request.headers.cookie;
    if (!cookies) return undefined;
    
    const parsedCookies = parseCookies(cookies);
    return parsedCookies['accessToken'];
  }
}
