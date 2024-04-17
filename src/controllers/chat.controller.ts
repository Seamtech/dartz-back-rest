import { Count, CountSchema, Filter, repository, Where} from '@loopback/repository';
import { post, param, get, getModelSchemaRef, patch, del, requestBody} from '@loopback/rest';
import { Chat } from '../models';
import { ChatRepository } from '../repositories';

export class ChatController {
  constructor(
    @repository(ChatRepository)
    public chatRepository: ChatRepository,
  ) { }

  @get('/chats/{id}', {
    responses: {
      '200': {
        description: 'Chat model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Chat, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
  ): Promise<Chat> {
    return this.chatRepository.findById(id);
  }

  @patch('/chats/{id}', {
    responses: {
      '204': {
        description: 'Chat PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Chat, {partial: true}),
        },
      },
    })
    chat: Partial<Chat>,
  ): Promise<void> {
    await this.chatRepository.updateById(id, chat);
  }

  @del('/chats/{id}', {
    responses: {
      '204': {
        description: 'Chat DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.chatRepository.deleteById(id);
  }

  @get('/chats', {
    responses: {
      '200': {
        description: 'Array of Chat model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Chat, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Chat) filter?: Filter<Chat>,
  ): Promise<Chat[]> {
    return this.chatRepository.find(filter);
  }
  
  @post('/chats', {
    responses: {
      '200': {
        description: 'Chat model instance',
        content: { 
          'application/json': { 
            schema: getModelSchemaRef(Chat) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Chat, {
            title: 'NewChat',
            exclude: ['id', 'createdAt'],
          }),
        },
      },
    })
    chat: Omit<Chat, 'id'>,
  ): Promise<Chat> {
    return this.chatRepository.create(chat);
  }

  // Add other CRUD operations (GET, PUT, DELETE) here
}
