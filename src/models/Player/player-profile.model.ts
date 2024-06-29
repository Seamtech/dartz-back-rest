import {Entity, hasOne, belongsTo, model, property, hasMany} from '@loopback/repository';
import {
  User,
  PlayerStatistics,
  PlayerAverageStatistics,
  TournamentDetails,
  TournamentTeamPlayer,
  TournamentMatch,
  TournamentPlayerResults
} from '../../models';

@model({
  settings: {idInjection: false, postgresql: {schema: 'dartz', table: 'player_profiles'}, hiddenProperties: ['userId']}
})
export class PlayerProfile extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'integer', nullable: 'NO'}
  })
  id: number;

  @belongsTo(() => User, {keyFrom: 'userId', keyTo: 'id'}, {
    postgresql: {columnName: 'user_id', dataType: 'integer', nullable: 'NO'}
  })
  userId: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'username', dataType: 'character varying', nullable: 'NO'}
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'email', dataType: 'character varying', nullable: 'NO'}
  })
  email: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'first_name', dataType: 'character varying', nullable: 'NO'}
  })
  firstName: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'last_name', dataType: 'character varying', nullable: 'NO'}
  })
  lastName: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'mobile_number', dataType: 'character varying', nullable: 'YES'}
  })
  mobileNumber?: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'address1', dataType: 'character varying', nullable: 'NO'}
  })
  address1: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'address2', dataType: 'character varying', nullable: 'YES'}
  })
  address2?: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'city', dataType: 'character varying', nullable: 'NO'}
  })
  city: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'state', dataType: 'character varying', nullable: 'NO'}
  })
  state: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'zip', dataType: 'character varying', nullable: 'NO'}
  })
  zip: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'bs_live_code', dataType: 'character varying', nullable: 'YES'}
  })
  bsLiveCode?: string;

  @property({
    type: 'number',
    postgresql: {columnName: 'default_location', dataType: 'integer', nullable: 'YES'}
  })
  defaultLocation?: number;

  @hasOne(() => PlayerStatistics, {keyTo: 'profileId'})
  playerStatistics: PlayerStatistics;

  @hasOne(() => PlayerAverageStatistics, {keyTo: 'profileId'})
  playerAverageStatistics: PlayerAverageStatistics;

  @hasMany(() => TournamentDetails, {keyTo: 'createdBy'})
  tournamentCreatedBy: TournamentDetails[];

  @hasMany(() => TournamentDetails, {keyTo: 'updatedBy'})
  tournamentUpdatedBy: TournamentDetails[];

  @hasMany(() => TournamentTeamPlayer, {keyTo: 'profileId'})
  tournamentTeamPlayers: TournamentTeamPlayer[];

  @hasMany(() => TournamentPlayerResults, {keyTo: 'profileId'})
  tournamentPlayerResults: TournamentPlayerResults[];

  @hasMany(() => TournamentMatch, {keyTo: 'createdBy'})
  createdTournamentMatches: TournamentMatch[];

  @hasMany(() => TournamentMatch, {keyTo: 'updatedBy'})
  updatedTournamentMatches: TournamentMatch[];

  constructor(data?: Partial<PlayerProfile>) {
    super(data);
  }
}

export interface PlayerProfileRelations {
  user?: User;
  playerStatistics?: PlayerStatistics;
  playerAverageStatistics?: PlayerAverageStatistics;
  tournamentCreatedBy?: TournamentDetails[];
  tournamentUpdatedBy?: TournamentDetails[];
  tournamentTeamPlayers?: TournamentTeamPlayer[];
  tournamentPlayerResults?: TournamentPlayerResults[];
  createdTournamentMatches?: TournamentMatch[];
  updatedTournamentMatches?: TournamentMatch[];
}

export type PlayerProfileWithRelations = PlayerProfile & PlayerProfileRelations;
