import { Filter, repository} from '@loopback/repository';
import { post, param, get, patch, del, requestBody, getModelSchemaRef } from '@loopback/rest';
import { Message } from '../models';
import { MessageRepository } from '../repositories';

export class MessageController {
    constructor(
        @repository(MessageRepository)
        public messageRepository: MessageRepository,
    ) { }

    @post('/messages', {
        responses: {
            '200': {
                description: 'Message model instance',
                content: { 'application/json': { schema: getModelSchemaRef(Message) } },
            },
        },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Message, {
                        title: 'NewMessage',
                        exclude: ['id', 'timestamp'],
                    }),
                },
            },
        })
        message: Omit<Message, 'id'>,
    ): Promise<Message> {
        return this.messageRepository.create(message);
    }
    //Get Messages by ID
    @get('/messages/{id}', {
        responses: {
            '200': {
                description: 'Message model instance',
                content: { 'application/json': { schema: getModelSchemaRef(Message) } },
            },
        },
    })
    async findById(
        @param.path.number('id') id: number,
    ): Promise<Message> {
        return this.messageRepository.findById(id);
    }
    //Get messages by chat ID
    @get('/chats/{chatId}/messages', {
        responses: {
          '200': {
            description: 'Array of Messages for a specific Chat',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: getModelSchemaRef(Message, {includeRelations: true}),
                },
              },
            },
          },
        },
      })
      async findMessagesByChatId(
        @param.path.number('chatId') chatId: number,
        @param.query.number('limit') limit: number = 10, // Default limit
        @param.query.number('offset') offset: number = 0, // Default offset
      ): Promise<Message[]> {
        const filter: Filter<Message> = {
          where: {chatId: chatId},
          limit,
          offset,
          // Add order by timestamp if needed
        };
        return this.messageRepository.find(filter);
      }
    

    @patch('/messages/{id}', {
        responses: {
            '204': {
                description: 'Message PATCH success',
            },
        },
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Message, { partial: true }),
                },
            },
        })
        message: Partial<Message>,
    ): Promise<void> {
        await this.messageRepository.updateById(id, message);
    }

    @del('/messages/{id}', {
        responses: {
            '204': {
                description: 'Message DELETE success',
            },
        },
    })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        await this.messageRepository.deleteById(id);
    }

}
