import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PgsqldbDataSource} from '../../datasources';
import {TournamentMatches, TournamentMatchesRelations} from '../../models';

export class TournamentMatchesRepository extends DefaultCrudRepository<
  TournamentMatches,
  typeof TournamentMatches.prototype.id,
  TournamentMatchesRelations
> {
  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
  ) {
    super(TournamentMatches, dataSource);
  }
}