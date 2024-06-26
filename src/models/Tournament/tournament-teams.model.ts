import {Entity, model, property} from '@loopback/repository';
import {TournamentWithRelations} from './tournament.model';
import {TeamWithRelations} from './team.model';

@model({
  settings: {idInjection: false, postgresql: {schema: 'dartz', table: 'tournament_teams'}}
})
export class TournamentTeams extends Entity {
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
    postgresql: {columnName: 'team_id', dataType: 'integer', nullable: 'NO'},
  })
  teamId: number;

  constructor(data?: Partial<TournamentTeams>) {
    super(data);
  }
}

export interface TournamentTeamsRelations {
  tournament?: TournamentWithRelations;
  team?: TeamWithRelations;
}

export type TournamentTeamsWithRelations = TournamentTeams & TournamentTeamsRelations;