import {Entity, belongsTo, model, property} from '@loopback/repository';
import { User } from './User/user.model';

@model({
  settings: {idInjection: false, postgresql: {schema: 'dartz', table: 'refresh_tokens'}}
})
export class RefreshTokens extends Entity {
  @property({
    type: 'number',
    required: true,
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
    postgresql: {columnName: 'token', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  token: string;

  @belongsTo(() => User)
  userId: number;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'expiry_time', dataType: 'timestamp without time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  expiryTime: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 45,
    generated: false,
    postgresql: {columnName: 'ip_address', dataType: 'character varying', dataLength: 45, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  ipAddress?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<RefreshTokens>) {
    super(data);
  }
}

export interface RefreshTokensRelations {
  user?: User;
}

export type RefreshTokensWithRelations = RefreshTokens & RefreshTokensRelations;
