import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory,
  HasOneRepositoryFactory,
  BelongsToAccessor,
} from '@loopback/repository';
import {Tournament, TournamentRelations, TournamentTeam, TournamentMatch, TournamentDetails, PlayerProfile, GameType} from '../../models';
import {PgsqldbDataSource} from '../../datasources';
import {inject, Getter} from '@loopback/core';
import { TournamentDetailsRepository, TournamentMatchRepository, TournamentTeamRepository } from '..';
import { GameTypeRepository } from '../game-type.repository';

export class TournamentRepository extends DefaultCrudRepository<
  Tournament,
  typeof Tournament.prototype.id,
  TournamentRelations
> {
  public readonly teams: HasManyRepositoryFactory<TournamentTeam, typeof Tournament.prototype.id>;
  public readonly matches: HasManyRepositoryFactory<TournamentMatch, typeof Tournament.prototype.id>;
  public readonly details: HasOneRepositoryFactory<TournamentDetails, typeof Tournament.prototype.id>;
  public readonly game: BelongsToAccessor<GameType, typeof Tournament.prototype.id>;
  public readonly createdBy: BelongsToAccessor<PlayerProfile, typeof Tournament.prototype.id>;
  public readonly updatedBy: BelongsToAccessor<PlayerProfile, typeof Tournament.prototype.id>;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('TournamentTeamRepository') protected tournamentTeamRepositoryGetter: Getter<TournamentTeamRepository>,
    @repository.getter('TournamentMatchRepository') protected tournamentMatchRepositoryGetter: Getter<TournamentMatchRepository>,
    @repository.getter('TournamentDetailsRepository') protected tournamentDetailsRepositoryGetter: Getter<TournamentDetailsRepository>,
    @repository.getter('GameTypeRepository') protected gameTypeRepositoryGetter: Getter<GameTypeRepository>,
  ) {
    super(Tournament, dataSource);
    this.teams = this.createHasManyRepositoryFactoryFor('teams', tournamentTeamRepositoryGetter);
    this.registerInclusionResolver('teams', this.teams.inclusionResolver);

    this.matches = this.createHasManyRepositoryFactoryFor('matches', tournamentMatchRepositoryGetter);
    this.registerInclusionResolver('matches', this.matches.inclusionResolver);

    this.details = this.createHasOneRepositoryFactoryFor('details', tournamentDetailsRepositoryGetter);
    this.registerInclusionResolver('details', this.details.inclusionResolver);

    this.game = this.createBelongsToAccessorFor('game', gameTypeRepositoryGetter);
    this.registerInclusionResolver('game', this.game.inclusionResolver);
  }
}
