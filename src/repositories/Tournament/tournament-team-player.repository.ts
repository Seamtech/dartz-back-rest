import {
  DefaultCrudRepository,
  BelongsToAccessor,
  repository,
} from '@loopback/repository';
import {TournamentTeamPlayer, TournamentTeamPlayerRelations, TournamentTeam, PlayerProfile} from '../../models';
import {Getter, inject} from '@loopback/core';
import {PgsqldbDataSource} from '../../datasources';
import {PlayerProfileRepository, TournamentTeamRepository} from '../';

export class TournamentTeamPlayerRepository extends DefaultCrudRepository<
  TournamentTeamPlayer,
  typeof TournamentTeamPlayer.prototype.id,
  TournamentTeamPlayerRelations
> {
  public readonly tournamentTeam: BelongsToAccessor<TournamentTeam, typeof TournamentTeamPlayer.prototype.id>;
  public readonly profile: BelongsToAccessor<PlayerProfile, typeof TournamentTeamPlayer.prototype.id>;
  public readonly createdBy: BelongsToAccessor<PlayerProfile, typeof TournamentTeamPlayer.prototype.id>;
  public readonly updatedBy: BelongsToAccessor<PlayerProfile, typeof TournamentTeamPlayer.prototype.id>;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('TournamentTeamRepository') protected tournamentTeamRepositoryGetter: Getter<TournamentTeamRepository>,
    @repository.getter('PlayerProfileRepository') protected playerProfileRepositoryGetter: Getter<PlayerProfileRepository>,
  ) {
    super(TournamentTeamPlayer, dataSource);

    this.tournamentTeam = this.createBelongsToAccessorFor('tournamentTeam', tournamentTeamRepositoryGetter);
    this.registerInclusionResolver('tournamentTeam', this.tournamentTeam.inclusionResolver);

    this.profile = this.createBelongsToAccessorFor('profile', playerProfileRepositoryGetter);
    this.registerInclusionResolver('profile', this.profile.inclusionResolver);

    this.createdBy = this.createBelongsToAccessorFor('createdBy', playerProfileRepositoryGetter);
    this.registerInclusionResolver('createdBy', this.createdBy.inclusionResolver);

    this.updatedBy = this.createBelongsToAccessorFor('updatedBy', playerProfileRepositoryGetter);
    this.registerInclusionResolver('updatedBy', this.updatedBy.inclusionResolver);
  }
}
