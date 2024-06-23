import {Entity, hasOne, model, property} from '@loopback/repository';
import {UserProfiles, UserProfilesWithRelations} from './user-profiles.model';
import {UserStatistics, UserStatisticsWithRelations} from './user-statistics.model';

@model({settings: {idInjection: false, postgresql: {schema: 'dartz', table: 'users'}}})
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'integer', nullable: 'NO'},
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'username', dataType: 'character varying', nullable: 'NO'},
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'email', dataType: 'character varying', nullable: 'NO'},
  })
  email: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'password_hash', dataType: 'character varying', nullable: 'NO'},
  })
  passwordHash: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {columnName: 'role', dataType: 'character varying', nullable: 'NO'},
  })
  role: string;

  @hasOne(() => UserProfiles, {keyTo: 'userId'})
  userProfile: UserProfiles;

  @hasOne(() => UserStatistics, {keyTo: 'userId'})
  userStatistics: UserStatistics;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  userProfile?: UserProfilesWithRelations;
  userStatistics?: UserStatisticsWithRelations;
}

export type UserWithRelations = User & UserRelations;

// Define the UserWithExcludedFields type to exclude passwordHash
export type UserWithExcludedFields = Omit<UserWithRelations, 'passwordHash'>;
