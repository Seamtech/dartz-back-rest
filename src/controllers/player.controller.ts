import {repository} from '@loopback/repository';
import {get, param, put, requestBody, HttpErrors} from '@loopback/rest';
import {UserRepository, UserProfilesRepository} from '../repositories';
import {UserWithExcludedFields, UserProfiles, User} from '../models';
import {intercept} from '@loopback/core';

export class PlayerController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserProfilesRepository)
    public userProfilesRepository: UserProfilesRepository,
  ) {}

  @get('/findPlayer', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                'x-ts-type': 'UserWithExcludedFields',
              },
            },
          },
        },
      },
    },
  })
  async findPlayer(
    @param.query.string('type') type: string,
    @param.query.string('value') value: string,
  ): Promise<UserWithExcludedFields[]> {
    try {
      const filter: any = {};
      if (type === 'id') {
        filter.id = parseInt(value, 10);
        if (isNaN(filter.id)) {
          throw new HttpErrors.BadRequest('Invalid ID value');
        }
      } else if (type === 'username') {
        filter.username = value;
      } else {
        throw new HttpErrors.BadRequest('Invalid search type');
      }

      const users = await this.userRepository.find({
        where: filter,
        include: ['userProfile', 'userStatistics'],
        fields: {
          passwordHash: false,
        },
      });

      if (!users.length) {
        throw new HttpErrors.NotFound('User not found');
      }
      
      return users;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) {
        throw error;
      }
      throw new HttpErrors.InternalServerError(`Error finding player: ${error.message}`);
    }
  }

  @intercept('interceptors.TokenAuthorizationInterceptor')
  @put('/updateProfile', {
    responses: {
      '200': {
        description: 'User profile updated',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': UserProfiles,
            },
          },
        },
      },
    },
  })
  async updateProfile(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              userId: { type: 'number' },
              username: { type: 'string' },
              email: { type: 'string' },
              mobileNumber: { type: 'string' },
              address1: { type: 'string' },
              address2: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              bsLiveCode: { type: 'string' },
            },
            required: ['userId'],
          },
        },
      },
    }) profileData: Partial<UserProfiles & { userId: number } & { username: string, email: string }>,
  ): Promise<void> {
    const { userId, username, email, ...updateData } = profileData;

    if (!userId) {
      throw new HttpErrors.BadRequest('userId is required');
    }

    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new HttpErrors.NotFound('User not found');
      }

      if (username) {
        const existingUser = await this.userRepository.findOne({ where: { username } });
        if (existingUser && existingUser.id !== userId) {
          throw new HttpErrors.Conflict('Username already exists');
        }
      }

      if (email) {
        const existingEmailUser = await this.userRepository.findOne({ where: { email } });
        if (existingEmailUser && existingEmailUser.id !== userId) {
          throw new HttpErrors.Conflict('Email already exists');
        }
      }

      // Update the User entity with username and email
      await this.userRepository.updateById(userId, { username, email });

      // Update the UserProfiles entity with other profile data
      await this.userProfilesRepository.updateById(userId, updateData);
    } catch (error) {
      if (error.message.includes('Username already exists')) {
        throw new HttpErrors.Conflict('Username already exists');
      }
      if (error.message.includes('Email already exists')) {
        throw new HttpErrors.Conflict('Email already exists');
      }
      if (error.code === 'ENTITY_NOT_FOUND') {
        throw new HttpErrors.NotFound('User not found');
      }
      throw new HttpErrors.InternalServerError(`Error updating profile: ${error.message}`);
    }
  }
}