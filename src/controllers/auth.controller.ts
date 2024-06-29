import { Getter, inject, intercept, InvocationContext } from '@loopback/core';
import { juggler, repository } from '@loopback/repository';
import {
  HttpErrors,
  Request,
  Response,
  RestBindings,
  get,
  getModelSchemaRef,
  post,
  patch,
  requestBody,
  response,
} from '@loopback/rest';
import { SecurityBindings, securityId, UserProfile } from '@loopback/security';
import * as bcrypt from 'bcryptjs';
import { UserCredentials, PlayerProfile, UserSignup, User } from '../models';
import { PlayerProfileRepository, UserRepository } from '../repositories';
import { JwtService } from '../services/authentication-strategies/jwt.service';
import { CustomUserProfile } from '../types';
import { parseCookies } from '../utils/cookie-parser';
import {
  PlayerAverageStatisticsRepository,
  PlayerStatisticsRepository,
} from '../repositories/Player';
import { ValidatorService } from '../services/authentication-strategies/validator.service';
import { PgsqldbDataSource } from '../datasources';

const USER_PROFILE_KEY = 'userProfile';

export class AuthController {
  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository(UserRepository) private usersRepository: UserRepository,
    @repository(PlayerProfileRepository)
    private playerProfileRepository: PlayerProfileRepository,
    @repository(PlayerStatisticsRepository)
    private playerStatisticsRepository: PlayerStatisticsRepository,
    @repository(PlayerAverageStatisticsRepository)
    private playerAverageStatisticsRepository: PlayerAverageStatisticsRepository,
    @inject('services.JwtService') private tokenService: JwtService,
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
    @inject.context() private context: InvocationContext, // Injecting context
  ) { }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
  private async validateUserCredentials(credentials: UserCredentials): Promise<CustomUserProfile> {
    console.log('Validating user credentials:', credentials);
    const user = await this.usersRepository.findOne({
      where: { or: [{ email: credentials.emailOrUsername }, { username: credentials.emailOrUsername }] },
      include: [{ relation: 'playerProfile' }], // Include the related player profile
    });
    console.log('User:', user)
    if (!user || !user.playerProfile) {
      throw new HttpErrors.Unauthorized('Invalid email/username or password.');
    }

    const passwordIsValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!passwordIsValid) {
      throw new HttpErrors.Unauthorized('Invalid email/username or password.');
    }

    return {
      [securityId]: user.id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      profileId: user.playerProfile.id,
    }
  }

  @post('/signup')
  @response(200, {
    description: 'User Signup',
    content: {
      'application/json': {
        schema: { type: 'object', properties: { message: { type: 'string' } } },
      },
    },
  })
  async signup(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserSignup, { title: 'NewUser' }),
        },
      },
    })
    newUserRequest: UserSignup,
  ): Promise<{ message: string }> {
    const db: juggler.DataSource = this.usersRepository.dataSource;
    const transaction = await db.beginTransaction({
      isolationLevel: 'READ COMMITTED' || undefined,
    });

    try {
      const hashedPassword = await this.hashPassword(newUserRequest.password);
      const savedUser = await this.usersRepository.create(
        {
          passwordHash: hashedPassword,
          role: '1',
          email: newUserRequest.email,
          username: newUserRequest.username,
        },
        { transaction },
      );

      await this.playerProfileRepository.create(
        {
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
        },
        { transaction },
      );

      await transaction.commit();
      return { message: 'Signup successful. Please log in.' };
    } catch (error) {
      await transaction.rollback();
      if (error.code === '23505') {
        // Unique constraint violation code for PostgreSQL
        if (error.detail.includes('email')) {
          throw new HttpErrors.Conflict('Email already exists.');
        }
        if (error.detail.includes('username')) {
          throw new HttpErrors.Conflict('Username already exists.');
        }
      }
      throw new HttpErrors.InternalServerError(
        `Error during signup: ${error.message}`,
      );
    }
  }

  @post('/login')
  @response(200, {
    description: 'User Login',
    content: {
      'application/json': {
        schema: { type: 'object', properties: { refreshToken: { type: 'string' } } },
      },
    },
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
    })
    credentials: UserCredentials,
    @inject(RestBindings.Http.RESPONSE) response: Response, // Injecting response
  ): Promise<{ refreshToken: string }> {
    // Validate credentials using ValidatorService
    ValidatorService.validateCredentials(credentials);

    // Validate user credentials using JwtService
    const userProfile = await this.validateUserCredentials(credentials);
console.log('User profile:', userProfile);
    // Create tokens and set cookie using JwtService
    const refreshToken = await this.tokenService.createTokensAndSetCookie(userProfile, response);

    return { refreshToken };
  }


  @post('/refresh-token')
  @response(200, {
    description: 'Refresh Token',
    content: {
      'application/json': {
        schema: { type: 'object', properties: { refreshToken: { type: 'string' } } },
      },
    },
  })
  async refreshToken(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: { refreshToken: { type: 'string' } },
          },
        },
      },
    })
    body: { refreshToken: string },
    @inject(RestBindings.Http.RESPONSE) response: Response, // Injecting response
  ): Promise<{ refreshToken: string }> {
    try {
      const userProfile = await this.tokenService.verifyRefreshToken(
        body.refreshToken,
      );
      const newRefreshToken = await this.tokenService.createTokensAndSetCookie(
        userProfile,
        response,
      );
      return { refreshToken: newRefreshToken };
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error refreshing token: ${error.message}`,
      );
    }
  }

  @post('/logout')
  @response(200, {
    description: 'User Logout',
    content: {
      'application/json': {
        schema: { type: 'object', properties: { message: { type: 'string' } } },
      },
    },
  })
  async logout(
    @requestBody({
      content: {
        'application/json': {
          schema: { type: 'object', properties: { token: { type: 'string' } } },
        },
      },
    })
    body: {
      token: string;
    },
  ): Promise<{ message: string }> {
    try {
      await this.tokenService.logout(this.request, this.response, body.token);
    } catch (error) {
      // Log the error if necessary
    } finally {
      // Always clear the cookie to ensure the client is logged out
      this.response.clearCookie('accessToken');
    }

    return { message: 'Logout successful' };
  }

  @intercept('interceptors.TokenAuthorizationInterceptor')
  @post('/change-password')
  @response(200, {
    description: 'Change Password',
    content: {
      'application/json': {
        schema: { type: 'object', properties: { message: { type: 'string' } } },
      },
    },
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
    })
    passwordData: {
      currentPassword: string;
      newPassword: string;
    },
  ): Promise<{ message: string }> {
    const userProfile: CustomUserProfile =
      this.tokenService.getUserProfileFromRequest(this.request);
    const userId = Number(userProfile[securityId]);

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new HttpErrors.NotFound('User not found.');
    }

    const passwordIsValid = await bcrypt.compare(
      passwordData.currentPassword,
      user.passwordHash,
    );
    if (!passwordIsValid) {
      throw new HttpErrors.Unauthorized('Current password is incorrect.');
    }

    const hashedNewPassword = await bcrypt.hash(passwordData.newPassword, 10);
    await this.usersRepository.updateById(userId, {
      passwordHash: hashedNewPassword,
    });

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
  async getMyProfile(
    @inject(RestBindings.Http.REQUEST) request: Request,
  ): Promise<any> {
    const userProfile = this.tokenService.getUserProfileFromRequest(request);
    const userId = Number(userProfile[securityId]);
    try {
      const profile = await this.playerProfileRepository.findOne({
        where: { userId },
        include: [
          {
            relation: 'playerStatistics',
            scope: {
              fields: {
                id: false,
                profileId: false, // Exclude 'id' and 'profileId'
              },
            },
          },
          {
            relation: 'playerAverageStatistics',
            scope: {
              fields: {
                id: false,
                profileId: false, // Exclude 'id' and 'profileId'
              },
            },
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


}
