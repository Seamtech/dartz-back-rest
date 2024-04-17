import {Entity, hasOne, model, property} from '@loopback/repository';
import { UserProfiles } from './user-profiles.model';
import { UserStatistics } from './user-statistics.model';

@model({settings: {idInjection: false, postgresql: {schema: 'dartz', table: 'users'}}})
export class User extends Entity {
  @hasOne(() => UserProfiles)
  userProfile: UserProfiles;

  @hasOne(() => UserStatistics)
  userStatistics: UserStatistics;

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
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'username', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'email', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  email: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'password_hash', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  passwordHash: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'role', dataType: 'string', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'FALSE', generated: false},
  })
  role: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
