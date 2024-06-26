import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {PgsqldbDataSource} from '../../datasources';
import {Tournament, TournamentRelations, TournamentTeams, TournamentMatches} from '../../models';
import {TournamentTeamsRepository} from './tournament-teams.repository';
import {TournamentMatchesRepository} from './tournament-matches.repository';

export class TournamentRepository extends DefaultCrudRepository<
  Tournament,
  typeof Tournament.prototype.id,
  TournamentRelations
> {
  public readonly tournamentTeams: HasManyRepositoryFactory<TournamentTeams, typeof Tournament.prototype.id>;
  public readonly tournamentMatches: HasManyRepositoryFactory<TournamentMatches, typeof Tournament.prototype.id>;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('TournamentTeamsRepository') protected tournamentTeamsRepositoryGetter: Getter<TournamentTeamsRepository>,
    @repository.getter('TournamentMatchesRepository') protected tournamentMatchesRepositoryGetter: Getter<TournamentMatchesRepository>,
  ) {
    super(Tournament, dataSource);

    this.tournamentTeams = this.createHasManyRepositoryFactoryFor('tournamentTeams', tournamentTeamsRepositoryGetter);
    this.registerInclusionResolver('tournamentTeams', this.tournamentTeams.inclusionResolver);

    this.tournamentMatches = this.createHasManyRepositoryFactoryFor('tournamentMatches', tournamentMatchesRepositoryGetter);
    this.registerInclusionResolver('tournamentMatches', this.tournamentMatches.inclusionResolver);
  }
}