import {juggler, repository} from '@loopback/repository';
import {HttpErrors, del, get, getModelSchemaRef, param, patch, post, requestBody, response, } from '@loopback/rest';
import * as bcrypt from 'bcryptjs';
import {User, UserCredentials} from '../models';
import {UserProfilesRepository, UserRepository, UserStatisticsRepository} from '../repositories';
//import {validateCredentials, Credentials} from '../services/validator'; // Assuming you have a validation function
//import { service } from '@loopback/core';
import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {intercept} from '@loopback/core';
import {securityId} from '@loopback/security';
import {UserSignup} from '../models/User/user-signup.model';
import {JwtService} from '../services/authentication-strategies/jwt.service';
import {AuthorizationService} from '../services/role-auth.service';
import {CustomUserProfile} from '../types';


export class UserController {
  constructor(
    //Inject Data Sources
    @repository(UserRepository)
    public usersRepository: UserRepository,
    @repository(UserProfilesRepository)
    public userProfilesRepository: UserProfilesRepository,
    @repository(UserStatisticsRepository)
    public userStatisticsRepository: UserStatisticsRepository,

    //Inject Services
    @inject('services.AuthorizationService')
    private authorizationService: AuthorizationService,
    @inject('services.UserService') public userService: UserService<User, UserCredentials>,
    @inject('services.JwtService') public tokenService: JwtService,

  ) { }

  //User Signup
  @post('/signup')
  @response(200, {
    description: 'User Signup',
    content: {'application/json': {schema: {type: 'object', properties: {token: {type: 'string'}}}}},
  })
  async signup(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserSignup, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: UserSignup,
  ): Promise<{token: string}> {

    const db: juggler.DataSource = this.usersRepository.dataSource;
    // Start a new transaction
    const transaction = await db.beginTransaction({isolationLevel: juggler.IsolationLevel});
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(newUserRequest.password, 10);
      // Create new user
      const savedUser = await this.usersRepository.create({
        username: newUserRequest.username,
        email: newUserRequest.email,
        passwordHash: hashedPassword,
        role: 'User'
      }, {transaction});
      await this.userProfilesRepository.create({
        userId: savedUser.id,
        firstName: newUserRequest.firstName,
        lastName: newUserRequest.lastName,
        mobileNumber: newUserRequest.mobileNumber ?? '',
        address1: newUserRequest.address1,
        address2: newUserRequest.address2,
        city: newUserRequest.city,
        state: newUserRequest.state,
        zip: newUserRequest.zip,
        bsLiveCode: newUserRequest.bsLiveCode ?? '',
        defaultLocation: newUserRequest.location ?? null,
      }, {transaction});
      await this.userStatisticsRepository.create({
        userId: savedUser.id,
      }, {transaction});
      // Generate user profile for the token
      const userProfile: CustomUserProfile = {
        [securityId]: savedUser.id.toString(),
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
        // Add other custom properties here if needed
      }
      // Generate a token
      const token = await this.tokenService.generateToken(userProfile);
      await transaction.commit();

      return {token};
    } catch (error) {
      // Rollback the transaction in case of an error
      await transaction.rollback();
      throw error;
    }
  }

  // User Login Endpoint
  @post('/user/login')
  @response(200, {
    description: 'User Login',
    content: {'application/json': {schema: {type: 'object', properties: {token: {type: 'string'}, user: {type: 'object'}}}}},
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserCredentials, {title: 'UserLogin'}),
        },
      },
    })
    credentials: UserCredentials,
  ): Promise<{token: string;}> {
    // Validate credentials
    const user = await this.usersRepository.findOne({
      where: {email: credentials.email},
      include: [{relation: 'userProfile'}, {relation: 'userStatistics'}],
    });
    if (!user) {
      throw new HttpErrors.Unauthorized('Invalid email or password.');
    }

    // Compare password
    const passwordIsValid = await bcrypt.compare(credentials.password, user.passwordHash) || false;
    if (!passwordIsValid) {
      throw new HttpErrors.Unauthorized('Invalid email or password.');
    }

    // Manually create a CustomUserProfile
    const customUserProfile: CustomUserProfile = {
      [securityId]: user.id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      // Add other custom properties here if needed
    };
    // Generate a token
    const token = await this.tokenService.generateToken(customUserProfile);

    // Prepare user data for response (excluding sensitive data)

    return {token};
  }

  // Other relevant user operations
  @intercept('interceptors.TokenAuthorizationInterceptor') // Token validation interceptor
  //@intercept('interceptors.RoleAuthorizationInterceptor') // Role-based access control interceptor
  @get('/user/profile')
  @response(200, {
    description: 'Array of all users',
    content: {
      'application/json': {
        schema: {
          type: 'array', items: getModelSchemaRef(User, {
            includeRelations: true,
            exclude: ['passwordHash'],
          })
        },
      },
    },
  })
  async findUsers(@inject('userProfile') userProfile: CustomUserProfile): Promise<User[]> {
    // Check if the user has required role
    if (!this.authorizationService.hasRequiredRole(userProfile, 'User')) {
      throw new HttpErrors.Forbidden('Access Denied');
    }

    return this.usersRepository.find({
      include: [
        {relation: 'userProfile'}, // Include the related userProfile
        {relation: 'userStatistics'} // Include the related userStatistics
      ],
      fields: {
        passwordHash: false, // Exclude passwordHash field
      }
    });
  }


  @patch('/users/{id}')
  @response(204, {
    description: 'User updated successfully',
  })
  async updateUser(
    @param.path.number('id') id: number,
    @requestBody() user: User,
  ): Promise<void> {
    await this.usersRepository.updateById(id, user);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'User deleted successfully',
  })
  async deleteUser(@param.path.number('id') id: number): Promise<void> {
    await this.usersRepository.deleteById(id);
  }


  // Add additional endpoints as needed for your tournament platform

}
