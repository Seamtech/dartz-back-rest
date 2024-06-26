import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {PgsqldbDataSource} from '../../datasources';
import {PlayerProfile, PlayerProfileRelations, PlayerStatistics, PlayerAverageStatistics} from '../../models';
import {PlayerStatisticsRepository} from './player-statistics.repository';
import {PlayerAverageStatisticsRepository} from './player-average-statistics.repository';

export class PlayerProfileRepository extends DefaultCrudRepository<
  PlayerProfile,
  typeof PlayerProfile.prototype.id,
  PlayerProfileRelations
> {
  public readonly playerStatistics: HasOneRepositoryFactory<PlayerStatistics, typeof PlayerProfile.prototype.id>;
  public readonly playerAverageStatistics: HasOneRepositoryFactory<PlayerAverageStatistics, typeof PlayerProfile.prototype.id>;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('PlayerStatisticsRepository') protected playerStatisticsRepositoryGetter: Getter<PlayerStatisticsRepository>,
    @repository.getter('PlayerAverageStatisticsRepository') protected playerAverageStatisticsRepositoryGetter: Getter<PlayerAverageStatisticsRepository>,
  ) {
    super(PlayerProfile, dataSource);
    
    this.playerStatistics = this.createHasOneRepositoryFactoryFor('playerStatistics', playerStatisticsRepositoryGetter);
    this.registerInclusionResolver('playerStatistics', (entities, inclusionResolverCtx) => {
      return this.playerStatistics.inclusionResolver(entities, inclusionResolverCtx);
    });
    
    this.playerAverageStatistics = this.createHasOneRepositoryFactoryFor('playerAverageStatistics', playerAverageStatisticsRepositoryGetter);
    this.registerInclusionResolver('playerAverageStatistics', (entities, inclusionResolverCtx) => {
      return this.playerAverageStatistics.inclusionResolver(entities, inclusionResolverCtx);
    });
  }
}
