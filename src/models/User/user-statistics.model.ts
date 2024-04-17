import {Entity, model, property} from '@loopback/repository';
import {  UserWithRelations } from './user.model';

@model({
  settings: {idInjection: false, postgresql: {schema: 'dartz', table: 'user_statistics'}}
})
export class UserStatistics extends Entity {
  //@belongsTo(() => User)
  //userStatsUserId: number;

  @property({
    type: 'number',
    generated: true,
    postgresql: {
      columnName: 'user_id',
      dataType: 'integer',
      generated: true
    },

  })
  userId: number;

    @property({
      type: 'number',
      required: false,
      jsonSchema: {nullable: false},
      scale: 0,
      generated: true,
      id: 1,
      postgresql: {columnName: 'id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO', generated: true},
    })
    id: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'total_games_played', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  totalGamesPlayed?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'total_games_won', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  totalGamesWon?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'total_games_lost', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  totalGamesLost?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 5,
    scale: 2,
    generated: false,
    postgresql: {columnName: 'ppd', dataType: 'numeric', dataLength: null, dataPrecision: 5, dataScale: 2, nullable: 'YES', generated: false},
  })
  ppd?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 5,
    scale: 2,
    generated: false,
    postgresql: {columnName: 'mpd', dataType: 'numeric', dataLength: null, dataPrecision: 5, dataScale: 2, nullable: 'YES', generated: false},
  })
  mpd?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 5,
    scale: 2,
    generated: false,
    postgresql: {columnName: 'z_rating', dataType: 'numeric', dataLength: null, dataPrecision: 5, dataScale: 2, nullable: 'YES', generated: false},
  })
  zRating?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 5,
    scale: 2,
    generated: false,
    postgresql: {columnName: 'player_rating', dataType: 'numeric', dataLength: null, dataPrecision: 5, dataScale: 2, nullable: 'YES', generated: false},
  })
  playerRating?: number;



  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserStatistics>) {
    super(data);
  }
}

export interface UserStatisticsRelations {
  user?: UserWithRelations; // Assuming UserStatistics belongs to User
}

export type UserStatisticsWithRelations = UserStatistics & UserStatisticsRelations;
