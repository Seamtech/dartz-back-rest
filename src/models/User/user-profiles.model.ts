import {Entity, model, property} from '@loopback/repository';
import {UserWithRelations} from './user.model';

@model({
  settings: {idInjection: false, postgresql: {schema: 'dartz', table: 'user_profiles'}}
})
export class UserProfiles extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
    postgresql: {columnName: 'user_id', dataType: 'integer', nullable: 'NO'},
  })
  userId: number;

  @property({
    type: 'string',
    postgresql: {columnName: 'first_name', dataType: 'character varying', nullable: 'YES'},
  })
  firstName?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'last_name', dataType: 'character varying', nullable: 'YES'},
  })
  lastName?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'mobile_number', dataType: 'character varying', nullable: 'YES'},
  })
  mobileNumber?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'address1', dataType: 'character varying', nullable: 'YES'},
  })
  address1?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'address2', dataType: 'character varying', nullable: 'YES'},
  })
  address2?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'city', dataType: 'character varying', nullable: 'YES'},
  })
  city?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'state', dataType: 'character varying', nullable: 'YES'},
  })
  state?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'zip', dataType: 'character varying', nullable: 'YES'},
  })
  zip?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'bs_live_code', dataType: 'character varying', nullable: 'YES'},
  })
  bsLiveCode?: string;

  @property({
    type: 'number',
    postgresql: {columnName: 'default_location', dataType: 'integer', nullable: 'YES'},
  })
  defaultLocation?: number;

  constructor(data?: Partial<UserProfiles>) {
    super(data);
  }
}

export interface UserProfilesRelations {
  user?: UserWithRelations;
}

export type UserProfilesWithRelations = UserProfiles & UserProfilesRelations;
