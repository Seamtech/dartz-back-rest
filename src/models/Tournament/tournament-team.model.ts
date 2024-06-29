import { Entity, model, property, belongsTo, hasMany } from '@loopback/repository';
import { PlayerProfile, TournamentTeamPlayer, Tournament, TournamentMatch, TournamentMatchResults, TournamentPlayerResults, TournamentMatchTeams } from '../';

@model({
  settings: {
    postgresql: {
      schema: 'dartz',
      table: 'tournament_teams',
    },
  },
})
export class TournamentTeam extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' }
  })
  id?: number;

  @belongsTo(() => Tournament, { keyFrom: 'tournamentId', keyTo: 'id' }, {
    postgresql: { columnName: 'tournament_id', dataType: 'integer', nullable: 'NO' }
  })
  tournamentId: number;

  @property({
    type: 'string',
    required: true,
    postgresql: { columnName: 'name', dataType: 'character varying', nullable: 'NO' }
  })
  name: string;

  @property({
    type: 'string',
    default: 'register',
    postgresql: { columnName: 'team_size', dataType: 'integer', nullable: 'YES' }
  })
  teamSize: number;

  @property({
    type: 'string',
    default: 'register',
    postgresql: { columnName: 'team_status', dataType: 'character varying', nullable: 'YES' }
  })
  teamStatus?: string;

  @property({
    type: 'string',
    default: 'now()',
    postgresql: { columnName: 'created_timestamp', dataType: 'timestamp', nullable: 'YES' }
  })
  createdTimestamp?: string;

  @property({
    type: 'string',
    default: 'now()',
    postgresql: { columnName: 'updated_timestamp', dataType: 'timestamp', nullable: 'YES' }
  })
  updatedTimestamp?: string;

  @belongsTo(() => PlayerProfile, { keyFrom: 'createdBy', keyTo: 'id' }, {
    postgresql: { columnName: 'created_by', dataType: 'integer', nullable: 'YES' }
  })
  createdById?: number;

  @belongsTo(() => PlayerProfile, { keyFrom: 'updatedBy', keyTo: 'id' }, {
    postgresql: { columnName: 'updated_by', dataType: 'integer', nullable: 'YES' }
  })
  updatedById?: number;

  @hasMany(() => TournamentTeamPlayer, { keyTo: 'tournamentTeamId' })
  players: TournamentTeamPlayer[];

  @hasMany(() => TournamentMatchTeams, { keyTo: 'tournamentTeamId' })
  matchTeams: TournamentMatchTeams[];

  constructor(data?: Partial<TournamentTeam>) {
    super(data);
  }
}

export interface TournamentTeamRelations {
  tournament?: Tournament;
  createdBy?: PlayerProfile;
  updatedBy?: PlayerProfile;
  players?: TournamentTeamPlayer[];
  matchTeams?: TournamentMatchTeams[];
}

export type TournamentTeamWithRelations = TournamentTeam & TournamentTeamRelations;
