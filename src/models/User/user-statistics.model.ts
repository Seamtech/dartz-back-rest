import {Entity, model, property} from '@loopback/repository';
import {UserWithRelations} from './user.model';

@model({
  settings: {idInjection: false, postgresql: {schema: 'dartz', table: 'user_statistics'}}
})
export class UserStatistics extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
    postgresql: {columnName: 'user_id', dataType: 'integer', nullable: 'NO'},
  })
  userId: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'total_games_played', dataType: 'integer', nullable: 'YES'},
  })
  totalGamesPlayed?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'total_games_won', dataType: 'integer', nullable: 'YES'},
  })
  totalGamesWon?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'total_games_lost', dataType: 'integer', nullable: 'YES'},
  })
  totalGamesLost?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'ppd', dataType: 'numeric', precision: 5, scale: 2, nullable: 'YES'},
  })
  ppd?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'mpd', dataType: 'numeric', precision: 5, scale: 2, nullable: 'YES'},
  })
  mpd?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'z_rating', dataType: 'numeric', precision: 5, scale: 2, nullable: 'YES'},
  })
  zRating?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'player_rating', dataType: 'numeric', precision: 5, scale: 2, nullable: 'YES'},
  })
  playerRating?: number;

  constructor(data?: Partial<UserStatistics>) {
    super(data);
  }
}

export interface UserStatisticsRelations {
  user?: UserWithRelations;
}

export type UserStatisticsWithRelations = UserStatistics & UserStatisticsRelations;
