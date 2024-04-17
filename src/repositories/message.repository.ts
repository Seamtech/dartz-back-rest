import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, BelongsToAccessor, repository} from '@loopback/repository';
import {PgsqldbDataSource} from '../datasources';
import {Message, MessageRelations, Chat} from '../models';
import {ChatRepository} from './chat.repository';

export class MessageRepository extends DefaultCrudRepository<
  Message,
  typeof Message.prototype.id,
  MessageRelations
> {
  public readonly chat: BelongsToAccessor<Chat, typeof Message.prototype.id>;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('ChatRepository') protected chatRepositoryGetter: Getter<ChatRepository>,
  ) {
    super(Message, dataSource);
    this.chat = this.createBelongsToAccessorFor('chat', chatRepositoryGetter);
    this.registerInclusionResolver('chat', this.chat.inclusionResolver);

    this.chat = this.createBelongsToAccessorFor('chat', chatRepositoryGetter);
    this.registerInclusionResolver('chat', this.chat.inclusionResolver);
  }
}
