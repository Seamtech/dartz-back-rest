import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory
} from '@loopback/repository';
import {PgsqldbDataSource} from '../datasources';
import {Chat, ChatRelations, Message} from '../models';
import {MessageRepository} from './message.repository';

export class ChatRepository extends DefaultCrudRepository<
  Chat,
  typeof Chat.prototype.id,
  ChatRelations
> {
  public readonly messages: HasManyRepositoryFactory<Message, typeof Chat.prototype.id>;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('MessageRepository') protected messageRepositoryGetter: Getter<MessageRepository>,
  ) {
    super(Chat, dataSource);
    this.messages = this.createHasManyRepositoryFactoryFor('messages', messageRepositoryGetter);
    this.registerInclusionResolver('messages', this.messages.inclusionResolver);
  }
}
