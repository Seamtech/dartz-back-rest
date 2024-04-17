import {Entity, model, property} from '@loopback/repository';
import { UserWithRelations } from './user.model';

@model({
  settings: {idInjection: false, postgresql: {schema: 'dartz', table: 'user_profiles'}}
})
export class UserProfiles extends Entity {
  //@belongsTo(() => User)
  //userProfileUserId: number;
  @property({
    type: 'number',
    postgresql: {
      columnName: 'user_id',
      dataType: 'integer',
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
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'first_name', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  firstName?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'last_name', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  lastName?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 20,
    generated: false,
    postgresql: {columnName: 'mobile_number', dataType: 'character varying', dataLength: 20, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  mobileNumber?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'address1', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  address1?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'address2', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  address2?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    postgresql: {columnName: 'city', dataType: 'character varying', dataLength: 100, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  city?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    postgresql: {columnName: 'state', dataType: 'character varying', dataLength: 100, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  state?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 20,
    generated: false,
    postgresql: {columnName: 'zip', dataType: 'character varying', dataLength: 20, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  zip?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    postgresql: {columnName: 'bs_live_code', dataType: 'character varying', dataLength: 100, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  bsLiveCode?: string;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'default_location', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'YES', generated: false},
  })
  defaultLocation?: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserProfiles>) {
    super(data);
  }
}

export interface UserProfilesRelations {
  user?: UserWithRelations; 
}
export type UserProfilesWithRelations = UserProfiles & UserProfilesRelations;
