import {juggler} from '@loopback/repository';

const config = {
  name: 'redis',
  connector: 'kv-redis',
  url: '',
  host: '127.0.0.1',
  port: 6379,
  password: '',
  db: 0,
};

export class RedisDataSource extends juggler.DataSource {
  static dataSourceName = 'redis';
  constructor() {
    super(config);
  }
}
