import {
  DefaultCrudRepository,
  BelongsToAccessor,
  repository
} from '@loopback/repository';
import {
  TournamentMatchResults,
  TournamentMatchResultsRelations,
  TournamentMatch,
  TournamentTeam,
  PlayerProfile
} from '../../models';
import {inject, Getter} from '@loopback/core';
import {
  TournamentMatchRepository,
  TournamentTeamRepository,
  PlayerProfileRepository
} from '../';
import {PgsqldbDataSource}from '../../datasources';

export class TournamentMatchResultsRepository extends DefaultCrudRepository<
  TournamentMatchResults,
  typeof TournamentMatchResults.prototype.id,
  TournamentMatchResultsRelations
> {
  public readonly tournamentMatch: BelongsToAccessor<TournamentMatch, typeof TournamentMatchResults.prototype.id>;
  public readonly winningTeam: BelongsToAccessor<TournamentTeam, typeof TournamentMatchResults.prototype.id>;
  public readonly losingTeam: BelongsToAccessor<TournamentTeam, typeof TournamentMatchResults.prototype.id>;
  public readonly createdBy: BelongsToAccessor<PlayerProfile, typeof TournamentMatchResults.prototype.id>;
  public readonly updatedBy: BelongsToAccessor<PlayerProfile, typeof TournamentMatchResults.prototype.id>;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('TournamentMatchRepository') protected tournamentMatchRepositoryGetter: Getter<TournamentMatchRepository>,
    @repository.getter('TournamentTeamRepository') protected tournamentTeamRepositoryGetter: Getter<TournamentTeamRepository>,
    @repository.getter('PlayerProfileRepository') protected playerProfileRepositoryGetter: Getter<PlayerProfileRepository>,
  ) {
    super(TournamentMatchResults, dataSource);

    this.tournamentMatch = this.createBelongsToAccessorFor('tournamentMatch', tournamentMatchRepositoryGetter);
    this.registerInclusionResolver('tournamentMatch', this.tournamentMatch.inclusionResolver);

    this.winningTeam = this.createBelongsToAccessorFor('winningTeam', tournamentTeamRepositoryGetter);
    this.registerInclusionResolver('winningTeam', this.winningTeam.inclusionResolver);

    this.losingTeam = this.createBelongsToAccessorFor('losingTeam', tournamentTeamRepositoryGetter);
    this.registerInclusionResolver('losingTeam', this.losingTeam.inclusionResolver);

    this.createdBy = this.createBelongsToAccessorFor('createdBy', playerProfileRepositoryGetter);
    this.registerInclusionResolver('createdBy', this.createdBy.inclusionResolver);

    this.updatedBy = this.createBelongsToAccessorFor('updatedBy', playerProfileRepositoryGetter);
    this.registerInclusionResolver('updatedBy', this.updatedBy.inclusionResolver);
  }
}
