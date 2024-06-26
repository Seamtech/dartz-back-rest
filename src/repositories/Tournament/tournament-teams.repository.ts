import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PgsqldbDataSource} from '../../datasources';
import {TournamentTeams, TournamentTeamsRelations} from '../../models';

export class TournamentTeamsRepository extends DefaultCrudRepository<
  TournamentTeams,
  typeof TournamentTeams.prototype.id,
  TournamentTeamsRelations
> {
  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
  ) {
    super(TournamentTeams, dataSource);
  }
}