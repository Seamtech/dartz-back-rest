import {Entity, model, property, belongsTo} from '@loopback/repository';
import {TournamentTeam, PlayerProfile} from '..';

@model({
  settings: {
    postgresql: {
      schema: 'dartz',
      table: 'tournament_team_players',
    },
  },
})
export class TournamentTeamPlayer extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'integer', nullable: 'NO'}
  })
  id?: number;

  @belongsTo(() => TournamentTeam, {keyFrom: 'tournamentTeamId', keyTo: 'id'}, {
    postgresql: {columnName: 'tournament_team_id', dataType: 'integer', nullable: 'NO'}
  })
  tournamentTeamId: number;

  @belongsTo(() => PlayerProfile, {keyFrom: 'profileId', keyTo: 'id'}, {
    postgresql: {columnName: 'profile_id', dataType: 'integer', nullable: 'NO'}
  })
  profileId: number;

  @property({
    type: 'boolean',
    default: false,
    postgresql: {columnName: 'is_captain', dataType: 'boolean', nullable: 'YES'}
  })
  isCaptain?: boolean;

  @property({
    type: 'string',
    postgresql: {columnName: 'join_date', dataType: 'timestamp', nullable: 'YES'}
  })
  joinDate?: string;

  @property({
    type: 'string',
    default: 'registered',
    postgresql: {columnName: 'status', dataType: 'character varying', nullable: 'YES'}
  })
  status?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'role', dataType: 'character varying', nullable: 'YES'}
  })
  role?: string;
  
  @belongsTo(() => PlayerProfile, {keyFrom: 'createdBy', keyTo: 'id'}, {
    postgresql: {columnName: 'created_by', dataType: 'integer', nullable: 'NO'}
  })
  createdById: number;

  @belongsTo(() => PlayerProfile, {keyFrom: 'updatedBy', keyTo: 'id'}, {
    postgresql: {columnName: 'updated_by', dataType: 'integer', nullable: 'NO'}
  })
  updatedById: number;

  constructor(data?: Partial<TournamentTeamPlayer>) {
    super(data);
  }
}

export interface TournamentTeamPlayerRelations {
  tournamentTeam?: TournamentTeam;
  profile?: PlayerProfile;
  createdBy?: PlayerProfile;
  updatedBy?: PlayerProfile;
}

export type TournamentTeamPlayerWithRelations = TournamentTeamPlayer & TournamentTeamPlayerRelations;
