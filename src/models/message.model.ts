import { Entity, belongsTo, model, property } from '@loopback/repository';
import { User } from './User';
import { Chat } from './Chat';
import { MessageMetadata, PrivateMessageMetadata } from '../types/message-types';


@model({ settings: { idInjection: false, postgresql: { schema: 'dartz', table: 'messages' }, hiddenProperties: ['privateMetaData'] } })
export class Message extends Entity {

    @belongsTo(() => Chat, {keyFrom: 'chatId', keyTo: 'id', name: 'chat'}, {
        type: 'number',
        required: true,
        postgresql: {
          columnName: 'chat_id',
          dataType: 'integer',
          nullable: 'NO',
        },
      })
      chatId: number;
    
      @belongsTo(() => User, {keyFrom: 'senderId', keyTo: 'id', name: 'user'}, {
        type: 'number',
        required: true,
        postgresql: {
          columnName: 'sender_id',
          dataType: 'integer',
          nullable: 'NO',
        },
      })
      senderId: number;
  
    
    @property({
        type: 'number',
        required: false,
        jsonSchema: { nullable: false },
        scale: 0,
        generated: true,
        id: 1,
        postgresql: { columnName: 'id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO', generated: true },
    })
    id: number;

    @property({
        type: 'string',
        required: false,
        jsonSchema: { nullable: false },
        generated: false,
        postgresql: { columnName: 'content', dataType: 'character varying', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false },
    })
    content: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: false },
        generated: true,
        postgresql: { columnName: 'timestamp', dataType: 'timestamp', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'FALSE', generated: true },
    })
    timestamp: string;

    @property({
        type: 'object',
        jsonSchema: { nullable: false },
        generated: false,
        postgresql: { columnName: 'metadata', dataType: 'json', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'FALSE', generated: false },
    })
    metaData?: MessageMetadata;

    @property({
        type: 'object',
        jsonSchema: { nullable: false },
        generated: false,
        postgresql: { columnName: 'private_metadata', dataType: 'json', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'FALSE', generated: false },
    })
    privateMetaData?: PrivateMessageMetadata;

    // Define well-known properties here

    // Indexer property to allow additional data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [prop: string]: any;

    constructor(data?: Partial<Message>) {
        super(data);
    }
}

export interface MessageRelations {
    chat: Chat; 
    user: User; 
}

export type MessageWithRelations = Message & MessageRelations;
