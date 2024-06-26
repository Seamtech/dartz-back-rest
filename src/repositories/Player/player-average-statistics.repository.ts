import { DefaultCrudRepository, repository } from '@loopback/repository';
import { PlayerAverageStatistics, PlayerAverageStatisticsRelations } from '../../models';
import { PgsqldbDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class PlayerAverageStatisticsRepository extends DefaultCrudRepository<
  PlayerAverageStatistics,
  typeof PlayerAverageStatistics.prototype.id,
  PlayerAverageStatisticsRelations
> {
  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
  ) {
    super(PlayerAverageStatistics, dataSource);
  }
}
