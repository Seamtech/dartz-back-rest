import {Entity, model, property} from '@loopback/repository';
import {TeamWithRelations} from './team.model';
import {UserWithRelations} from '../User/user.model';

@model({
  settings: {idInjection: false, postgresql: {schema: 'dartz', table: 'team_players'}}
})
export class TeamPlayers extends Entity {
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
    postgresql: {columnName: 'team_id', dataType: 'integer', nullable: 'NO'},
  })
  teamId: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {columnName: 'user_id', dataType: 'integer', nullable: 'NO'},
  })
  userId: number;

  constructor(data?: Partial<TeamPlayers>) {
    super(data);
  }
}

export interface TeamPlayersRelations {
  team?: TeamWithRelations;
  user?: UserWithRelations;
}

export type TeamPlayersWithRelations = TeamPlayers & TeamPlayersRelations;