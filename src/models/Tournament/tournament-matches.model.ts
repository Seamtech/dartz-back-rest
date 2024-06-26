import {Entity, model, property} from '@loopback/repository';
import {TournamentWithRelations} from './tournament.model';
import {TeamWithRelations} from './team.model';

@model({
  settings: {idInjection: false, postgresql: {schema: 'dartz', table: 'tournament_matches'}}
})
export class TournamentMatches extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'integer', nullable: 'NO'},
  })
  id: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {columnName: 'tournament_id', dataType: 'integer', nullable: 'NO'},
  })
  tournamentId: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {columnName: 'winning_team_id', dataType: 'integer', nullable: 'NO'},
  })
  winningTeamId: number;

  @property({
    type: 'date',
    required: true,
    postgresql: {columnName: 'match_date', dataType: 'timestamp without time zone', nullable: 'NO'},
  })
  matchDate: string;

  constructor(data?: Partial<TournamentMatches>) {
    super(data);
  }
}

export interface TournamentMatchesRelations {
  tournament?: TournamentWithRelations;
  winningTeam?: TeamWithRelations;
}

export type TournamentMatchesWithRelations = TournamentMatches & TournamentMatchesRelations;