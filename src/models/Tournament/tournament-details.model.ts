import { Entity, model, property, belongsTo } from '@loopback/repository';
import { PlayerProfile, Tournament } from '../';

@model({
  settings: {
    postgresql: {
      schema: 'dartz',
      table: 'tournament_details',
    },
  },
})
export class TournamentDetails extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
  })
  id: number;

  @belongsTo(() => Tournament, {keyFrom: 'tournamentId', keyTo: 'id'}, {
    postgresql: { columnName: 'tournament_id', dataType: 'integer', nullable: 'NO' }
  })
  tournamentId: number;

  @property({
    type: 'string',
    required: true,
    postgresql: { columnName: 'tournament_name', dataType: 'character varying', nullable: 'NO' }
  })
  tournamentName: string;

  @property({
    type: 'string',
    postgresql: { columnName: 'tournament_description', dataType: 'character varying', nullable: 'YES' }
  })
  tournamentDescription?: string;

  @property({
    type: 'string',
    required: true,
    postgresql: { columnName: 'scheduled_start', dataType: 'timestamp', nullable: 'NO' }
  })
  scheduledStart: string;

  @property({
    type: 'number',
    required: true,
    postgresql: { columnName: 'max_players', dataType: 'integer', nullable: 'NO' }
  })
  maxPlayers: number;

  @property({
    type: 'string',
    required: true,
    postgresql: { columnName: 'tournament_status', dataType: 'character varying', nullable: 'NO' }
  })
  tournamentStatus: string;

  @property({
    type: 'number',
    postgresql: { columnName: 'current_round', dataType: 'integer', nullable: 'YES' }
  })
  currentRound?: number;

  @property({
    type: 'string',
    postgresql: { columnName: 'actual_start', dataType: 'character varying', nullable: 'YES' }
  })
  actualStart?: string;

  @property({
    type: 'string',
    postgresql: { columnName: 'completed_timestamp', dataType: 'timestamp', nullable: 'YES' }
  })
  completedTimestamp?: string;

  @property({
    type: 'number',
    postgresql: { columnName: 'winning_team_id', dataType: 'integer', nullable: 'YES' }
  })
  winningTeamId?: number;

  @belongsTo(() => PlayerProfile, { keyFrom: 'createdBy', keyTo: 'id' }, {
    postgresql: { columnName: 'created_by', dataType: 'integer', nullable: 'NO' }
  })
  createdBy: number;

  @property({
    type: 'string',
    default: () => new Date(),
    postgresql: { columnName: 'created_timestamp', dataType: 'timestamp', nullable: 'YES' }
  })
  createdTimestamp?: string;

  @belongsTo(() => PlayerProfile, { keyFrom: 'updatedBy', keyTo: 'id' }, {
    postgresql: { columnName: 'updated_by', dataType: 'integer', nullable: 'NO' }
  })
  updatedBy: number;

  @property({
    type: 'string',
    default: () => new Date(),
    postgresql: { columnName: 'updated_timestamp', dataType: 'timestamp', nullable: 'YES' }
  })
  updatedTimestamp?: string;

  constructor(data?: Partial<TournamentDetails>) {
    super(data);
  }
}

export interface TournamentDetailsRelations {
  tournament?: Tournament;
  createdByProfile?: PlayerProfile;
  updatedByProfile?: PlayerProfile;
}

export type TournamentDetailsWithRelations = TournamentDetails & TournamentDetailsRelations;
