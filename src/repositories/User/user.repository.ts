import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {User, UserRelations, PlayerStatistics, PlayerAverageStatistics,PlayerProfile} from '../../models';
import {PgsqldbDataSource} from '../../datasources';
import {inject, Getter} from '@loopback/core';
import {PlayerProfileRepository} from '../Player/player-profile.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly playerProfile: HasOneRepositoryFactory<PlayerProfile, typeof User.prototype.id>;
  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('PlayerProfileRepository') protected playerProfileRepositoryGetter: Getter<PlayerProfileRepository>,
  ) {
    super(User, dataSource);
    this.playerProfile = this.createHasOneRepositoryFactoryFor('playerProfile', playerProfileRepositoryGetter);
    this.registerInclusionResolver('playerProfile', async (entities, inclusionResolverCtx) => {
      console.log('Debug: entities', entities);
      return this.playerProfile.inclusionResolver(entities, inclusionResolverCtx);
    });

  }
}
