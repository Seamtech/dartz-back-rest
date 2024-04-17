import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {PgsqldbDataSource} from '../datasources';
import {UserProfiles, UserStatistics, User, UserRelations} from '../models';
import { UserStatisticsRepository } from './user-statistics.repository';
import { UserProfilesRepository } from './user-profiles.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.userId,
  UserRelations
> {
  public readonly userProfile: HasOneRepositoryFactory<UserProfiles, typeof User.prototype.userId>;
  public readonly userStatistics: HasOneRepositoryFactory<UserStatistics, typeof User.prototype.userId>;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('UserProfilesRepository') protected userProfilesRepositoryGetter: Getter<UserProfilesRepository>,
    @repository.getter('UserStatisticsRepository') protected userStatisticsRepositoryGetter: Getter<UserStatisticsRepository>,
  ) {
    super(User, dataSource);
    this.userProfile = this.createHasOneRepositoryFactoryFor('userProfile', userProfilesRepositoryGetter);
    this.registerInclusionResolver('userProfile', this.userProfile.inclusionResolver);

    this.userStatistics = this.createHasOneRepositoryFactoryFor('userStatistics', userStatisticsRepositoryGetter);
    this.registerInclusionResolver('userStatistics', this.userStatistics.inclusionResolver);
  }
}