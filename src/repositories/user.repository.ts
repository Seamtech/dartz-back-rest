import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {PgsqldbDataSource} from '../datasources';
import {User, UserProfiles, UserRelations, UserStatistics} from '../models';
import {UserProfilesRepository} from './user-profiles.repository';
import {UserStatisticsRepository} from './user-statistics.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly userProfile: HasOneRepositoryFactory<UserProfiles, typeof User.prototype.id>;
  public readonly userStatistics: HasOneRepositoryFactory<UserStatistics, typeof User.prototype.id>;

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
