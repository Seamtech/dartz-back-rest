import {Entity, belongsTo, model, property} from '@loopback/repository';
import {PlayerProfile} from './player-profile.model';

@model({settings: {postgresql: {schema: 'dartz', table: 'player_average_statistics' }, hiddenProperties: ['id', 'profileId']}})
export class PlayerAverageStatistics extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
  })
  id: number;

  @belongsTo(() => PlayerProfile, { keyFrom: 'profileId', keyTo: 'id' }, {
    postgresql: { columnName: 'profile_id', dataType: 'integer', nullable: 'NO' },
  })
  profileId: number;
  
  @property({
    type: 'number',
    postgresql: {columnName: 'ppd', dataType: 'numeric', precision: 5, scale: 2, nullable: 'YES'}
  })
  ppd?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'mpr', dataType: 'numeric', precision: 5, scale: 2, nullable: 'YES'}
  })
  mpr?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'player_rating', dataType: 'numeric', precision: 5, scale: 2, nullable: 'YES'}
  })
  playerRating?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'z_rating', dataType: 'numeric', precision: 5, scale: 2, nullable: 'YES'}
  })
  zRating?: number;

  constructor(data?: Partial<PlayerAverageStatistics>) {
    super(data);
  }
}

export interface PlayerAverageStatisticsRelations {
  playerProfile?: PlayerProfile;
}

export type PlayerAverageStatisticsWithRelations = PlayerAverageStatistics & PlayerAverageStatisticsRelations;
