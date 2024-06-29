import {
  DefaultCrudRepository,
  BelongsToAccessor,
  repository,
  HasManyRepositoryFactory,
  HasOneRepositoryFactory,
} from '@loopback/repository';
import {
  TournamentMatch,
  TournamentMatchRelations,
  Tournament,
  PlayerProfile,
  TournamentMatchResults,
  TournamentPlayerResults,
  TournamentMatchTeams
} from '../../models';
import { inject, Getter } from '@loopback/core';
import {
  TournamentRepository,
  PlayerProfileRepository,
  TournamentMatchResultsRepository,
  TournamentPlayerResultsRepository,
  TournamentMatchTeamsRepository
} from '../';
import { PgsqldbDataSource } from '../../datasources';

export class TournamentMatchRepository extends DefaultCrudRepository<
  TournamentMatch,
  typeof TournamentMatch.prototype.id,
  TournamentMatchRelations
> {
  public readonly tournament: BelongsToAccessor<Tournament, typeof TournamentMatch.prototype.id>;
  public readonly createdBy: BelongsToAccessor<PlayerProfile, typeof TournamentMatch.prototype.id>;
  public readonly updatedBy: BelongsToAccessor<PlayerProfile, typeof TournamentMatch.prototype.id>;
  public readonly matchResult: HasOneRepositoryFactory<TournamentMatchResults, typeof TournamentMatch.prototype.id>;
  public readonly playerResults: HasManyRepositoryFactory<TournamentPlayerResults, typeof TournamentMatch.prototype.id>;
  public readonly matchTeams: HasManyRepositoryFactory<TournamentMatchTeams, typeof TournamentMatch.prototype.id>;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('TournamentRepository') protected tournamentRepositoryGetter: Getter<TournamentRepository>,
    @repository.getter('PlayerProfileRepository') protected playerProfileRepositoryGetter: Getter<PlayerProfileRepository>,
    @repository.getter('TournamentMatchResultsRepository') protected tournamentMatchResultsRepositoryGetter: Getter<TournamentMatchResultsRepository>,
    @repository.getter('TournamentPlayerResultsRepository') protected tournamentPlayerResultsRepositoryGetter: Getter<TournamentPlayerResultsRepository>,
    @repository.getter('TournamentMatchTeamsRepository') protected tournamentMatchTeamsRepositoryGetter: Getter<TournamentMatchTeamsRepository>,
  ) {
    super(TournamentMatch, dataSource);

    this.tournament = this.createBelongsToAccessorFor('tournament', tournamentRepositoryGetter);
    this.registerInclusionResolver('tournament', this.tournament.inclusionResolver);

    this.createdBy = this.createBelongsToAccessorFor('createdBy', playerProfileRepositoryGetter);
    this.registerInclusionResolver('createdBy', this.createdBy.inclusionResolver);

    this.updatedBy = this.createBelongsToAccessorFor('updatedBy', playerProfileRepositoryGetter);
    this.registerInclusionResolver('updatedBy', this.updatedBy.inclusionResolver);

    this.matchResult = this.createHasOneRepositoryFactoryFor('matchResult', tournamentMatchResultsRepositoryGetter);
    this.registerInclusionResolver('matchResult', this.matchResult.inclusionResolver);

    this.playerResults = this.createHasManyRepositoryFactoryFor('playerResults', tournamentPlayerResultsRepositoryGetter);
    this.registerInclusionResolver('playerResults', this.playerResults.inclusionResolver);

    this.matchTeams = this.createHasManyRepositoryFactoryFor('matchTeams', tournamentMatchTeamsRepositoryGetter);
    this.registerInclusionResolver('matchTeams', this.matchTeams.inclusionResolver);
  }
}
