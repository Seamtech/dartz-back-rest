import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
import {
  TournamentDetails,
  TournamentDetailsRelations,
  Tournament,
  PlayerProfile
} from '../../models';
import { inject, Getter } from '@loopback/core';
import { PgsqldbDataSource } from '../../datasources';
import { PlayerProfileRepository, TournamentRepository } from '..';

export class TournamentDetailsRepository extends DefaultCrudRepository<
  TournamentDetails,
  typeof TournamentDetails.prototype.id,
  TournamentDetailsRelations
> {
  public readonly tournament: BelongsToAccessor<Tournament, typeof TournamentDetails.prototype.id>;
  public readonly createdByProfile: BelongsToAccessor<PlayerProfile, typeof TournamentDetails.prototype.id>;
  public readonly updatedByProfile: BelongsToAccessor<PlayerProfile, typeof TournamentDetails.prototype.id>;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('TournamentRepository') protected tournamentRepositoryGetter: Getter<TournamentRepository>,
    @repository.getter('PlayerProfileRepository') protected playerProfileRepositoryGetter: Getter<PlayerProfileRepository>,
  ) {
    super(TournamentDetails, dataSource);

    this.tournament = this.createBelongsToAccessorFor('tournament', tournamentRepositoryGetter);
    this.registerInclusionResolver('tournament', this.tournament.inclusionResolver);

    this.createdByProfile = this.createBelongsToAccessorFor('createdBy', playerProfileRepositoryGetter);
    this.registerInclusionResolver('createdByProfile', this.createdByProfile.inclusionResolver);

    this.updatedByProfile = this.createBelongsToAccessorFor('updatedBy', playerProfileRepositoryGetter);
    this.registerInclusionResolver('updatedByProfile', this.updatedByProfile.inclusionResolver);
  }
}
