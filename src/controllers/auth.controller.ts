import { Getter, inject, intercept, InvocationContext } from '@loopback/core';
import { juggler, repository } from '@loopback/repository';
import { HttpErrors, Request, Response, RestBindings, getModelSchemaRef, post, requestBody, response } from '@loopback/rest';
import { securityId } from '@loopback/security';
import * as bcrypt from 'bcryptjs';
import { UserCredentials, UserProfiles, UserSignup } from '../models';
import { UserProfilesRepository, UserRepository, UserStatisticsRepository } from '../repositories';
import { JwtService } from '../services/authentication-strategies/jwt.service';
import { CustomUserProfile } from '../types';
import { parseCookies } from '../utils/cookie-parser';

const USER_PROFILE_KEY = 'userProfile';

export class AuthController {
  constructor(
    @repository(UserRepository) private usersRepository: UserRepository,
    @repository(UserProfilesRepository) private userProfilesRepository: UserProfilesRepository,
    @repository(UserStatisticsRepository) private userStatisticsRepository: UserStatisticsRepository,
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
      where: { email: credentials.email },
      include: [{ relation: 'userProfile' }, { relation: 'userStatistics' }],
    });

    if (!user) {
      throw new HttpErrors.Unauthorized('Invalid email or password.');
    }

    const passwordIsValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!passwordIsValid) {
      throw new HttpErrors.Unauthorized('Invalid email or password.');
    }

    return {
      [securityId]: user.id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
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
        username: newUserRequest.username,
        email: newUserRequest.email,
        passwordHash: hashedPassword,
        role: '1',
      }, { transaction });

      await this.userProfilesRepository.create({
        userId: savedUser.id,
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

      await this.userStatisticsRepository.create({ userId: savedUser.id }, { transaction });

      await transaction.commit();
      return { message: 'Signup successful. Please log in.' };
    } catch (error) {
      await transaction.rollback();
      if (error.code === '23505') { // Unique constraint violation code for PostgreSQL
        if (error.detail.includes('email')) {
          throw new HttpErrors.Conflict('Email is already in use.');
        }
        if (error.detail.includes('username')) {
          throw new HttpErrors.Conflict('Username is already in use.');
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
          schema: getModelSchemaRef(UserCredentials, { title: 'UserLogin' }),
        },
      },
    }) credentials: UserCredentials,
  ): Promise<{ refreshToken: string }> {
    const userProfile = await this.validateUserCredentials(credentials);
    console.log(userProfile);
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
  }) passwordData: { currentPassword: string; newPassword: string },
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

  private getTokenFromCookie(): string | undefined {
    const cookies = this.request.headers.cookie;
    if (!cookies) return undefined;
    
    const parsedCookies = parseCookies(cookies);
    return parsedCookies['accessToken'];
  }
}
