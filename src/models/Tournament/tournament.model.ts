// src/models/tournament.model.ts

import { Entity, model, property, hasMany, belongsTo, hasOne } from '@loopback/repository';
import { TournamentTeam, TournamentMatch, TournamentDetails, GameType, PlayerProfile } from '../';

@model({
  settings: {
    postgresql: {
      schema: 'dartz',
      table: 'tournaments',
    },
    hiddenProperties: [],
  },
})
export class Tournament extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' }
  })
  id?: number;

  @property({
    type: 'string',
    postgresql: { columnName: 'tournament_type', dataType: 'character varying', nullable: 'YES' }
  })
  tournamentType?: string;

  @property({
    type: 'string',
    postgresql: { columnName: 'platform', dataType: 'character varying', nullable: 'YES' }
  })
  platform?: string;

  @property({
    type: 'number',
    postgresql: {
      columnName: 'entry_fee_amount',
      dataType: 'DECIMAL',
      precision: 10,
      scale: 2,
      nullable: 'YES',
    },
  })
  entryFeeAmount?: number;

  @property({
    type: 'string',
    postgresql: { columnName: 'entry_fee_type', dataType: 'character varying', nullable: 'YES' }
  })
  entryFeeType?: string;

  @property({
    type: 'string',
    postgresql: { columnName: 'tournament_format', dataType: 'character varying', nullable: 'YES' }
  })
  tournamentFormat?: string;

  @belongsTo(() => GameType, {name: 'game', keyFrom: 'gameId', keyTo: 'id'}, {postgresql: {columnName: 'game_id'}})
  gameId: number;

  @hasOne(() => TournamentDetails, { keyTo: 'tournamentId' })
  details: TournamentDetails;

  @hasMany(() => TournamentTeam, { keyTo: 'tournamentId' })
  teams: TournamentTeam[];

  @hasMany(() => TournamentMatch, { keyTo: 'tournamentId' })
  matches: TournamentMatch[];

  constructor(data?: Partial<Tournament>) {
    super(data);
  }
}

export interface TournamentRelations {
  teams?: TournamentTeam[];
  matches?: TournamentMatch[];
  details?: TournamentDetails;
  game?: GameType;
}

export type TournamentWithRelations = Tournament & TournamentRelations;
