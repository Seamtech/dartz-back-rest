import {Entity, model, property, belongsTo} from '@loopback/repository';
import {TournamentMatch, TournamentTeam} from '../../models';

@model({
  settings: {
    postgresql: {
      schema: 'dartz',
      table: 'tournament_match_teams',
    },
  },
})
export class TournamentMatchTeams extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'integer', nullable: 'NO'},
  })
  id?: number;

  @belongsTo(() => TournamentMatch, {keyFrom: 'tournamentMatchId', keyTo: 'id'}, {
    postgresql: {columnName: 'tournament_match_id', dataType: 'integer', nullable: 'NO'},
  })
  tournamentMatchId: number;

  @belongsTo(() => TournamentTeam, {keyFrom: 'tournamentTeamId', keyTo: 'id'}, {
    postgresql: {columnName: 'tournament_team_id', dataType: 'integer', nullable: 'NO'},
  })
  tournamentTeamId: number;

  @property({
    type: 'boolean',
    default: false,
    postgresql: {columnName: 'is_winner', dataType: 'boolean', nullable: 'YES'},
  })
  isWinner?: boolean;

  constructor(data?: Partial<TournamentMatchTeams>) {
    super(data);
  }
}

export interface TournamentMatchTeamsRelations {
  tournamentMatch?: TournamentMatch;
  tournamentTeam?: TournamentTeam;
}

export type TournamentMatchTeamsWithRelations = TournamentMatchTeams & TournamentMatchTeamsRelations;
