import {Entity, model, property, belongsTo} from '@loopback/repository';
import {PlayerProfile, TournamentMatch, TournamentTeam} from '../../models';

@model({
  settings: {
    postgresql: {
      schema: 'dartz',
      table: 'tournament_player_results',
    },
  },
})
export class TournamentPlayerResults extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'integer', nullable: 'NO'}
  })
  id?: number;

  @belongsTo(() => PlayerProfile, {keyFrom: 'profileId', keyTo: 'id'}, {
    postgresql: {columnName: 'profile_id', dataType: 'integer', nullable: 'NO'}
  })
  profileId: number;

  @belongsTo(() => TournamentMatch, {keyFrom: 'tournamentMatchId', keyTo: 'id'}, {
    postgresql: {columnName: 'tournament_match_id', dataType: 'integer', nullable: 'NO'}
  })
  tournamentMatchId: number;

  @belongsTo(() => TournamentTeam, {keyFrom: 'tournamentTeamId', keyTo: 'id'}, {
    postgresql: {columnName: 'tournament_team_id', dataType: 'integer', nullable: 'NO'}
  })
  tournamentTeamId: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'mpr', dataType: 'double precision', nullable: 'YES'}
  })
  mpr?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'ppd', dataType: 'double precision', nullable: 'YES'}
  })
  ppd?: number;

  @property({
    type: 'number',
    default: 0,
    postgresql: {columnName: 'games_played', dataType: 'integer', nullable: 'YES'}
  })
  gamesPlayed?: number;

  @property({
    type: 'number',
    default: 0,
    postgresql: {columnName: 'games_won', dataType: 'integer', nullable: 'YES'}
  })
  gamesWon?: number;

  @property({
    type: 'number',
    default: 0,
    postgresql: {columnName: 'games_lost', dataType: 'integer', nullable: 'YES'}
  })
  gamesLost?: number;

  @property({
    type: 'string',
    default: () => new Date().toISOString(),
    postgresql: {columnName: 'created_timestamp', dataType: 'timestamp', nullable: 'YES'}
  })
  createdTimestamp?: string;

  @belongsTo(() => PlayerProfile, {keyFrom: 'createdBy', keyTo: 'id'}, {
    postgresql: {columnName: 'created_by', dataType: 'integer', nullable: 'NO'}
  })
  createdBy: number;

  @property({
    type: 'string',
    default: () => new Date().toISOString(),
    postgresql: {columnName: 'updated_timestamp', dataType: 'timestamp', nullable: 'YES'}
  })
  updatedTimestamp?: string;

  @belongsTo(() => PlayerProfile, {keyFrom: 'updatedBy', keyTo: 'id'}, {
    postgresql: {columnName: 'updated_by', dataType: 'integer', nullable: 'NO'}
  })
  updatedBy: number;

  constructor(data?: Partial<TournamentPlayerResults>) {
    super(data);
  }
}

export interface TournamentPlayerResultsRelations {
  playerProfile?: PlayerProfile;
  tournamentMatch?: TournamentMatch;
  tournamentTeam?: TournamentTeam;
  createdBy?: PlayerProfile;
  updatedBy?: PlayerProfile;
}

export type TournamentPlayerResultsWithRelations = TournamentPlayerResults & TournamentPlayerResultsRelations;
