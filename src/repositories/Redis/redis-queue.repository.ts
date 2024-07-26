// src/repositories/queue.repository.ts
import {inject} from '@loopback/core';
import {DefaultKeyValueRepository} from '@loopback/repository';
import {RedisQueueDataSource} from '../../datasources';
import {QueueModel} from '../../models/Redis/redis-queue.model';

export class QueueRepository extends DefaultKeyValueRepository<QueueModel> {
  constructor(
    @inject('datasources.redisQueue') dataSource: RedisQueueDataSource,
  ) {
    super(QueueModel, dataSource);
  }
}
