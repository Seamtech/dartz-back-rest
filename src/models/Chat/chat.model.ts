import {Entity, hasMany, model, property} from '@loopback/repository';
import { Message } from '../message.model';


@model({settings: {idInjection: false, postgresql: {schema: 'dartz', table: 'chats'}}})
export class Chat extends Entity {
  
  @hasMany(() => Message)
  messages: Message[];

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
    required: false,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'parent_id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  parentId?: number;

  @property({
    type: 'string',
    required: false,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'parent_type', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  parentType?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'description', dataType: 'character varying', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  description: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: false},
    generated: true,
    postgresql: {columnName: 'created_at', dataType: 'timestamp', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'FALSE', generated: true},
  })
  createdAt: string;

  @property({
    type: 'number',
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'created_by', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'FALSE', generated: false},
  })
  createdBy: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Chat>) {
    super(data);
  }
}

export interface ChatRelations {
  // describe navigational properties here
}

export type ChatWithRelations = Chat & ChatRelations;
