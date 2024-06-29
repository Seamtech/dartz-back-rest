// src/repositories/game-type.repository.ts

import { DefaultCrudRepository, repository, HasManyRepositoryFactory } from '@loopback/repository';
import { GameType, GameTypeRelations, Tournament } from '../models';
import { Getter, inject } from '@loopback/core';
import { PgsqldbDataSource } from '../datasources';
import { TournamentRepository } from './';

export class GameTypeRepository extends DefaultCrudRepository<
  GameType,
  typeof GameType.prototype.id,
  GameTypeRelations
> {
  public readonly tournaments: HasManyRepositoryFactory<Tournament, typeof GameType.prototype.id>;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('TournamentRepository') protected tournamentRepositoryGetter: Getter<TournamentRepository>,
  ) {
    super(GameType, dataSource);
    this.tournaments = this.createHasManyRepositoryFactoryFor('tournaments', tournamentRepositoryGetter);
    this.registerInclusionResolver('tournaments', this.tournaments.inclusionResolver);
  }
}
