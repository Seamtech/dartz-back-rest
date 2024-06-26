import {Entity, hasMany, model, property} from '@loopback/repository';
import {TeamPlayers, TeamPlayersWithRelations} from './team-players.model';
import {TournamentTeams, TournamentTeamsWithRelations} from './tournament-teams.model';

@model({settings: {idInjection: false, postgresql: {schema: 'dartz', table: 'teams'}}})
export class Team extends Entity {
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
    postgresql: {columnName: 'team_name', dataType: 'character varying', nullable: 'NO'},
  })
  teamName: string;

  @hasMany(() => TeamPlayers, {keyTo: 'teamId'})
  teamPlayers: TeamPlayers[];

  @hasMany(() => TournamentTeams, {keyTo: 'teamId'})
  tournamentTeams: TournamentTeams[];

  constructor(data?: Partial<Team>) {
    super(data);
  }
}

export interface TeamRelations {
  teamPlayers?: TeamPlayersWithRelations[];
  tournamentTeams?: TournamentTeamsWithRelations[];
}

export type TeamWithRelations = Team & TeamRelations;