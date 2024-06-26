import { DefaultCrudRepository, repository } from '@loopback/repository';
import { PlayerStatistics, PlayerStatisticsRelations } from '../../models';
import { PgsqldbDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class PlayerStatisticsRepository extends DefaultCrudRepository<
  PlayerStatistics,
  typeof PlayerStatistics.prototype.id,
  PlayerStatisticsRelations
> {
  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
  ) {
    super(PlayerStatistics, dataSource);
  }
}
