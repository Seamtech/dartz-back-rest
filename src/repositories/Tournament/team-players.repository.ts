import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PgsqldbDataSource} from '../../datasources';
import {TeamPlayers, TeamPlayersRelations} from '../../models';

export class TeamPlayersRepository extends DefaultCrudRepository<
  TeamPlayers,
  typeof TeamPlayers.prototype.id,
  TeamPlayersRelations
> {
  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
  ) {
    super(TeamPlayers, dataSource);
  }
}