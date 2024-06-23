import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PgsqldbDataSource} from '../datasources';
import {UserStatistics, UserStatisticsRelations} from '../models';

export class UserStatisticsRepository extends DefaultCrudRepository<
  UserStatistics,
  typeof UserStatistics.prototype.userId,
  UserStatisticsRelations
> {
  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
  ) {
    super(UserStatistics, dataSource);
  }
}
