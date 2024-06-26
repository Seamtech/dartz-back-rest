import {Entity, hasMany, model, property} from '@loopback/repository';
import {TournamentTeams, TournamentTeamsWithRelations} from './tournament-teams.model';
import {TournamentMatches, TournamentMatchesWithRelations} from './tournament-matches.model';

@model({settings: {idInjection: false, postgresql: {schema: 'dartz', table: 'tournaments'}}})
export class Tournament extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'integer', nullable: 'NO'},
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'name', dataType: 'character varying', nullable: 'NO'},
  })
  name: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'format', dataType: 'character varying', nullable: 'NO'},
  })
  format: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'type', dataType: 'character varying', nullable: 'NO'},
  })
  type: string;

  @property({
    type: 'number',
    postgresql: {columnName: 'entry_fee', dataType: 'numeric', precision: 10, scale: 2, nullable: 'YES'},
  })
  entryFee?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'player_rating_limit', dataType: 'numeric', precision: 5, scale: 2, nullable: 'YES'},
  })
  playerRatingLimit?: number;

  @property({
    type: 'date',
    required: true,
    postgresql: {columnName: 'tournament_date', dataType: 'timestamp without time zone', nullable: 'NO'},
  })
  tournamentDate: string;

  @hasMany(() => TournamentTeams, {keyTo: 'tournamentId'})
  tournamentTeams: TournamentTeams[];

  @hasMany(() => TournamentMatches, {keyTo: 'tournamentId'})
  tournamentMatches: TournamentMatches[];

  constructor(data?: Partial<Tournament>) {
    super(data);
  }
}

export interface TournamentRelations {
  tournamentTeams?: TournamentTeamsWithRelations[];
  tournamentMatches?: TournamentMatchesWithRelations[];
}

export type TournamentWithRelations = Tournament & TournamentRelations;