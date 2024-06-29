import { DefaultCrudRepository, BelongsToAccessor, repository, HasManyRepositoryFactory } from '@loopback/repository';
import { TournamentTeam, TournamentTeamRelations, Tournament, PlayerProfile, TournamentTeamPlayer, TournamentMatchTeams } from '../../models';
import { inject, Getter } from '@loopback/core';
import { PgsqldbDataSource } from '../../datasources';
import { PlayerProfileRepository, TournamentRepository, TournamentTeamPlayerRepository, TournamentMatchTeamsRepository } from '../';

export class TournamentTeamRepository extends DefaultCrudRepository<
  TournamentTeam,
  typeof TournamentTeam.prototype.id,
  TournamentTeamRelations
> {
  public readonly tournament: BelongsToAccessor<Tournament, typeof TournamentTeam.prototype.id>;
  public readonly createdBy: BelongsToAccessor<PlayerProfile, typeof TournamentTeam.prototype.id>;
  public readonly updatedBy: BelongsToAccessor<PlayerProfile, typeof TournamentTeam.prototype.id>;
  public readonly players: HasManyRepositoryFactory<TournamentTeamPlayer, typeof TournamentTeam.prototype.id>;
  public readonly matchTeams: HasManyRepositoryFactory<TournamentMatchTeams, typeof TournamentTeam.prototype.id>;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('TournamentRepository') protected tournamentRepositoryGetter: Getter<TournamentRepository>,
    @repository.getter('PlayerProfileRepository') protected playerProfileRepositoryGetter: Getter<PlayerProfileRepository>,
    @repository.getter('TournamentTeamPlayerRepository') protected tournamentTeamPlayerRepositoryGetter: Getter<TournamentTeamPlayerRepository>,
    @repository.getter('TournamentMatchTeamsRepository') protected tournamentMatchTeamsRepositoryGetter: Getter<TournamentMatchTeamsRepository>,
  ) {
    super(TournamentTeam, dataSource);

    this.tournament = this.createBelongsToAccessorFor('tournament', tournamentRepositoryGetter);
    this.registerInclusionResolver('tournament', this.tournament.inclusionResolver);

    this.createdBy = this.createBelongsToAccessorFor('createdBy', playerProfileRepositoryGetter);
    this.registerInclusionResolver('createdBy', this.createdBy.inclusionResolver);

    this.updatedBy = this.createBelongsToAccessorFor('updatedBy', playerProfileRepositoryGetter);
    this.registerInclusionResolver('updatedBy', this.updatedBy.inclusionResolver);

    this.players = this.createHasManyRepositoryFactoryFor('players', tournamentTeamPlayerRepositoryGetter);
    this.registerInclusionResolver('players', this.players.inclusionResolver);

    this.matchTeams = this.createHasManyRepositoryFactoryFor('matchTeams', tournamentMatchTeamsRepositoryGetter);
    this.registerInclusionResolver('matchTeams', this.matchTeams.inclusionResolver);
  }
}