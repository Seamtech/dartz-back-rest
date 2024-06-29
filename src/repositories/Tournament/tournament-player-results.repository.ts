import {TournamentPlayerResults, TournamentPlayerResultsRelations, PlayerProfile, TournamentMatch, TournamentTeam} from '../../models';
import {PlayerProfileRepository, TournamentMatchRepository, TournamentTeamRepository} from '../';
import {PgsqldbDataSource} from '../../datasources';
import { BelongsToAccessor, DefaultCrudRepository, Getter, repository } from '@loopback/repository';
import { inject } from '@loopback/core';

export class TournamentPlayerResultsRepository extends DefaultCrudRepository<
  TournamentPlayerResults,
  typeof TournamentPlayerResults.prototype.id,
  TournamentPlayerResultsRelations
> {
  public readonly profile: BelongsToAccessor<PlayerProfile, typeof TournamentPlayerResults.prototype.id>;
  public readonly tournamentMatch: BelongsToAccessor<TournamentMatch, typeof TournamentPlayerResults.prototype.id>;
  public readonly tournamentTeam: BelongsToAccessor<TournamentTeam, typeof TournamentPlayerResults.prototype.id>;
  public readonly createdBy: BelongsToAccessor<PlayerProfile, typeof TournamentPlayerResults.prototype.id>;
  public readonly updatedBy: BelongsToAccessor<PlayerProfile, typeof TournamentPlayerResults.prototype.id>;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('PlayerProfileRepository') protected playerProfileRepositoryGetter: Getter<PlayerProfileRepository>,
    @repository.getter('TournamentMatchRepository') protected tournamentMatchRepositoryGetter: Getter<TournamentMatchRepository>,
    @repository.getter('TournamentTeamRepository') protected tournamentTeamRepositoryGetter: Getter<TournamentTeamRepository>,
  ) {
    super(TournamentPlayerResults, dataSource);

    this.profile = this.createBelongsToAccessorFor('profile', playerProfileRepositoryGetter);
    this.registerInclusionResolver('profile', this.profile.inclusionResolver);

    this.tournamentMatch = this.createBelongsToAccessorFor('tournamentMatch', tournamentMatchRepositoryGetter);
    this.registerInclusionResolver('tournamentMatch', this.tournamentMatch.inclusionResolver);

    this.tournamentTeam = this.createBelongsToAccessorFor('tournamentTeam', tournamentTeamRepositoryGetter);
    this.registerInclusionResolver('tournamentTeam', this.tournamentTeam.inclusionResolver);

    this.createdBy = this.createBelongsToAccessorFor('createdBy', playerProfileRepositoryGetter);
    this.registerInclusionResolver('createdBy', this.createdBy.inclusionResolver);

    this.updatedBy = this.createBelongsToAccessorFor('updatedBy', playerProfileRepositoryGetter);
    this.registerInclusionResolver('updatedBy', this.updatedBy.inclusionResolver);
  }
}
