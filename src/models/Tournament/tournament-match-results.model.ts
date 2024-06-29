import {Entity, model, property, belongsTo} from '@loopback/repository';
import {TournamentMatch, TournamentTeam, PlayerProfile} from '../../models';

@model({
  settings: {
    postgresql: {
      schema: 'dartz',
      table: 'tournament_match_results',
    },
  },
})
export class TournamentMatchResults extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'integer', nullable: 'NO'},
  })
  id?: number;

  @belongsTo(() => TournamentMatch, {keyFrom: 'tournamentMatchId', keyTo: 'id'}, {
    postgresql: {columnName: 'tournament_match_id', dataType: 'integer', nullable: 'NO'},
  })
  tournamentMatchId: number;

  @belongsTo(() => TournamentTeam, {keyFrom: 'winningTeamId', keyTo: 'id'}, {
    postgresql: {columnName: 'winning_team_id', dataType: 'integer', nullable: 'NO'},
  })
  winningTeamId: number;

  @belongsTo(() => TournamentTeam, {keyFrom: 'losingTeamId', keyTo: 'id'}, {
    postgresql: {columnName: 'losing_team_id', dataType: 'integer', nullable: 'NO'},
  })
  losingTeamId: number;

  @belongsTo(() => PlayerProfile, {keyFrom: 'createdBy', keyTo: 'id'}, {
    postgresql: {columnName: 'created_by', dataType: 'integer', nullable: 'NO'},
  })
  createdBy: number;

  @property({
    type: 'string',
    default: () => new Date().toISOString(),
    postgresql: {columnName: 'created_timestamp', dataType: 'timestamp', nullable: 'YES'},
  })
  createdTimestamp?: string;

  @belongsTo(() => PlayerProfile, {keyFrom: 'updatedBy', keyTo: 'id'}, {
    postgresql: {columnName: 'updated_by', dataType: 'integer', nullable: 'NO'},
  })
  updatedBy: number;

  @property({
    type: 'string',
    default: () => new Date().toISOString(),
    postgresql: {columnName: 'updated_timestamp', dataType: 'timestamp', nullable: 'YES'},
  })
  updatedTimestamp?: string;

  constructor(data?: Partial<TournamentMatchResults>) {
    super(data);
  }
}

export interface TournamentMatchResultsRelations {
  tournamentMatch?: TournamentMatch;
  winningTeam?: TournamentTeam;
  losingTeam?: TournamentTeam;
  createdBy?: PlayerProfile;
  updatedBy?: PlayerProfile;
}

export type TournamentMatchResultsWithRelations = TournamentMatchResults & TournamentMatchResultsRelations;
