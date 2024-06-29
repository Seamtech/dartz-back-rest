import {Entity, model, property, belongsTo, hasOne, hasMany} from '@loopback/repository';
import {Tournament} from './tournament.model';
import {TournamentMatchResults, TournamentPlayerResults, PlayerProfile, TournamentMatchTeams} from '../';

@model({
  settings: {
    postgresql: {
      schema: 'dartz',
      table: 'tournament_match',
    },
  },
})
export class TournamentMatch extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'integer', nullable: 'NO'},
  })
  id?: number;

  @belongsTo(() => Tournament, { keyFrom: 'tournamentId', keyTo: 'id' }, {
    postgresql: {columnName: 'tournament_id', dataType: 'integer', nullable: 'NO'},
  })
  tournamentId: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'match_start', dataType: 'character varying', nullable: 'NO'},
  })
  matchStart: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'match_end', dataType: 'character varying', nullable: 'YES'},
  })
  matchEnd?: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'match_status', dataType: 'character varying', nullable: 'NO'},
  })
  matchStatus: string;

  @property({
    type: 'number',
    postgresql: {columnName: 'tournament_round', dataType: 'integer', nullable: 'YES'},
  })
  tournamentRound?: number;

  @property({
    type: 'string',
    postgresql: {columnName: 'type', dataType: 'character varying', nullable: 'YES'},
  })
  type?: string;

  @property({
    type: 'string',
    default: () => new Date().toISOString(),
    postgresql: {columnName: 'created_timestamp', dataType: 'timestamp', nullable: 'YES'},
  })
  createdTimestamp?: string;

  @belongsTo(() => PlayerProfile, { keyFrom: 'createdBy', keyTo: 'id' }, {
    postgresql: {columnName: 'created_by', dataType: 'integer', nullable: 'NO'},
  })
  createdBy: number;

  @property({
    type: 'string',
    default: () => new Date().toISOString(),
    postgresql: {columnName: 'updated_timestamp', dataType: 'timestamp', nullable: 'YES'},
  })
  updatedTimestamp?: string;

  @belongsTo(() => PlayerProfile, { keyFrom: 'updatedBy', keyTo: 'id' }, {
    postgresql: {columnName: 'updated_by', dataType: 'integer', nullable: 'NO'},
  })
  updatedBy: number;

  @hasOne(() => TournamentMatchResults, { keyTo: 'matchId' })
  matchResult?: TournamentMatchResults;

  @hasMany(() => TournamentPlayerResults, { keyTo: 'matchId' })
  playerResults?: TournamentPlayerResults[];

  @hasMany(() => TournamentMatchTeams, { keyTo: 'tournamentMatchId' })
  matchTeams?: TournamentMatchTeams[];

  constructor(data?: Partial<TournamentMatch>) {
    super(data);
  }
}

export interface TournamentMatchRelations {
  tournament?: Tournament;
  createdBy?: PlayerProfile;
  updatedBy?: PlayerProfile;
  matchResult?: TournamentMatchResults;
  playerResults?: TournamentPlayerResults[];
  matchTeams?: TournamentMatchTeams[];
}

export type TournamentMatchWithRelations = TournamentMatch & TournamentMatchRelations;
