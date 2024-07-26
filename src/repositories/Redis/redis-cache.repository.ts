// src/repositories/cache.repository.ts
import {inject} from '@loopback/core';
import {DefaultKeyValueRepository} from '@loopback/repository';
import {RedisCacheDataSource} from '../../datasources';
import {CacheModel} from '../../models/Redis/redis-cache.model';

export class CacheRepository extends DefaultKeyValueRepository<CacheModel> {
  constructor(
    @inject('datasources.redisCache') dataSource: RedisCacheDataSource,
  ) {
    super(CacheModel, dataSource);
  }
}
