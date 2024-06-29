import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasOneRepositoryFactory,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {PgsqldbDataSource} from '../../datasources';
import {
  PlayerProfile,
  PlayerProfileRelations,
  PlayerStatistics,
  PlayerAverageStatistics,
  TournamentDetails,
  TournamentTeamPlayer,
  TournamentPlayerResults,
  TournamentMatch,
} from '../../models';
import {
  PlayerStatisticsRepository,
  PlayerAverageStatisticsRepository,
  TournamentDetailsRepository,
  TournamentTeamPlayerRepository,
  TournamentPlayerResultsRepository,
  TournamentMatchRepository,
} from '..';

export class PlayerProfileRepository extends DefaultCrudRepository<
  PlayerProfile,
  typeof PlayerProfile.prototype.id,
  PlayerProfileRelations
> {
  public readonly playerStatistics: HasOneRepositoryFactory<
    PlayerStatistics,
    typeof PlayerProfile.prototype.id
  >;
  public readonly playerAverageStatistics: HasOneRepositoryFactory<
    PlayerAverageStatistics,
    typeof PlayerProfile.prototype.id
  >;
  public readonly tournamentCreatedBy: HasManyRepositoryFactory<
    TournamentDetails,
    typeof PlayerProfile.prototype.id
  >;
  public readonly tournamentUpdatedBy: HasManyRepositoryFactory<
    TournamentDetails,
    typeof PlayerProfile.prototype.id
  >;
  public readonly tournamentTeamPlayers: HasManyRepositoryFactory<
    TournamentTeamPlayer,
    typeof PlayerProfile.prototype.id
  >;
  public readonly tournamentPlayerResults: HasManyRepositoryFactory<
    TournamentPlayerResults,
    typeof PlayerProfile.prototype.id
  >;
  public readonly createdTournamentMatches: HasManyRepositoryFactory<
    TournamentMatch,
    typeof PlayerProfile.prototype.id
  >;
  public readonly updatedTournamentMatches: HasManyRepositoryFactory<
    TournamentMatch,
    typeof PlayerProfile.prototype.id
  >;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('PlayerStatisticsRepository')
    protected playerStatisticsRepositoryGetter: Getter<PlayerStatisticsRepository>,
    @repository.getter('PlayerAverageStatisticsRepository')
    protected playerAverageStatisticsRepositoryGetter: Getter<PlayerAverageStatisticsRepository>,
    @repository.getter('TournamentDetailsRepository')
    protected tournamentDetailsRepositoryGetter: Getter<TournamentDetailsRepository>,
    @repository.getter('TournamentTeamPlayerRepository')
    protected tournamentTeamPlayerRepositoryGetter: Getter<TournamentTeamPlayerRepository>,
    @repository.getter('TournamentPlayerResultsRepository')
    protected tournamentPlayerResultsRepositoryGetter: Getter<TournamentPlayerResultsRepository>,
    @repository.getter('TournamentMatchRepository')
    protected tournamentMatchRepositoryGetter: Getter<TournamentMatchRepository>,
  ) {
    super(PlayerProfile, dataSource);
    this.playerStatistics = this.createHasOneRepositoryFactoryFor(
      'playerStatistics',
      playerStatisticsRepositoryGetter,
    );
    this.registerInclusionResolver(
      'playerStatistics',
      this.playerStatistics.inclusionResolver,
    );
    this.playerAverageStatistics = this.createHasOneRepositoryFactoryFor(
      'playerAverageStatistics',
      playerAverageStatisticsRepositoryGetter,
    );
    this.registerInclusionResolver(
      'playerAverageStatistics',
      this.playerAverageStatistics.inclusionResolver,
    );
    this.tournamentCreatedBy = this.createHasManyRepositoryFactoryFor(
      'tournamentCreatedBy',
      tournamentDetailsRepositoryGetter,
    );
    this.registerInclusionResolver(
      'tournamentCreatedBy',
      this.tournamentCreatedBy.inclusionResolver,
    );
    this.tournamentUpdatedBy = this.createHasManyRepositoryFactoryFor(
      'tournamentUpdatedBy',
      tournamentDetailsRepositoryGetter,
    );
    this.registerInclusionResolver(
      'tournamentUpdatedBy',
      this.tournamentUpdatedBy.inclusionResolver,
    );

    this.tournamentTeamPlayers = this.createHasManyRepositoryFactoryFor(
      'tournamentTeamPlayers',
      tournamentTeamPlayerRepositoryGetter,
    );
    this.registerInclusionResolver(
      'tournamentTeamPlayers',
      this.tournamentTeamPlayers.inclusionResolver,
    );

    this.tournamentPlayerResults = this.createHasManyRepositoryFactoryFor(
      'tournamentPlayerResults',
      tournamentPlayerResultsRepositoryGetter,
    );
    this.registerInclusionResolver(
      'tournamentPlayerResults',
      this.tournamentPlayerResults.inclusionResolver,
    );

    this.createdTournamentMatches = this.createHasManyRepositoryFactoryFor(
      'createdTournamentMatches',
      tournamentMatchRepositoryGetter,
    );
    this.registerInclusionResolver(
      'createdTournamentMatches',
      this.createdTournamentMatches.inclusionResolver,
    );

    this.updatedTournamentMatches = this.createHasManyRepositoryFactoryFor(
      'updatedTournamentMatches',
      tournamentMatchRepositoryGetter,
    );
    this.registerInclusionResolver(
      'updatedTournamentMatches',
      this.updatedTournamentMatches.inclusionResolver,
    );
  }
}
