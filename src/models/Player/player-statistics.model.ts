import {Entity, belongsTo, model, property} from '@loopback/repository';
import {PlayerProfile} from './player-profile.model';

@model({
  settings: {idInjection: false, postgresql: {schema: 'dartz', table: 'player_statistics' }, hiddenProperties: ['id', 'profileId']}
})
export class PlayerStatistics extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
  })
  id: number;

  @belongsTo(() => PlayerProfile, { keyFrom: 'profileId', keyTo: 'id' }, {
    postgresql: { columnName: 'profile_id', dataType: 'integer', nullable: 'NO' },
  })
  profileId: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'total_games_played', dataType: 'integer', nullable: 'YES'}
  })
  totalGamesPlayed?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'total_games_won', dataType: 'integer', nullable: 'YES'}
  })
  totalGamesWon?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'total_games_lost', dataType: 'integer', nullable: 'YES'}
  })
  totalGamesLost?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'tournaments_won', dataType: 'integer', nullable: 'YES'}
  })
  tournamentsWon?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'tournaments_played', dataType: 'integer', nullable: 'YES'}
  })
  tournamentsPlayed?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'tournament_winnings', dataType: 'numeric', precision: 10, scale: 2, nullable: 'YES'}
  })
  tournamentWinnings?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'z_championships', dataType: 'integer', nullable: 'YES'}
  })
  zChampionships?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'z_winnings', dataType: 'numeric', precision: 10, scale: 2, nullable: 'YES'}
  })
  zWinnings?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'total_winnings', dataType: 'numeric', precision: 10, scale: 2, nullable: 'YES'}
  })
  totalWinnings?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'z_seasons_played', dataType: 'integer', nullable: 'YES'}
  })
  zSeasonsPlayed?: number;

  constructor(data?: Partial<PlayerStatistics>) {
    super(data);
  }
}

export interface PlayerStatisticsRelations {
  playerProfile?: PlayerProfile;
}

export type PlayerStatisticsWithRelations = PlayerStatistics & PlayerStatisticsRelations;
