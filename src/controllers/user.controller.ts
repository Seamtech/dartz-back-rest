import { repository } from '@loopback/repository';
import { HttpErrors, del, get, getModelSchemaRef, param, patch, requestBody, response } from '@loopback/rest';
import { User } from '../models';
import { UserRepository, UserProfilesRepository, UserStatisticsRepository } from '../repositories';
import { inject } from '@loopback/core';
import { intercept } from '@loopback/core';
import { securityId } from '@loopback/security';
import { AuthorizationService } from '../services/role-auth.service';
import { CustomUserProfile } from '../types';

export class UserController {
  constructor(
    @repository(UserRepository)
    public usersRepository: UserRepository,
    @repository(UserProfilesRepository)
    public userProfilesRepository: UserProfilesRepository,
    @repository(UserStatisticsRepository)
    public userStatisticsRepository: UserStatisticsRepository,

    @inject('services.AuthorizationService')
    private authorizationService: AuthorizationService,
  ) {}

  @intercept('interceptors.TokenAuthorizationInterceptor')
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
    if (!this.authorizationService.hasRequiredRole(userProfile, 'User')) {
      throw new HttpErrors.Forbidden('Access Denied');
    }
    return this.usersRepository.find({
      include: [
        {relation: 'userProfile'},
        {relation: 'userStatistics'}
      ],
      fields: {
        passwordHash: false,
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
}
