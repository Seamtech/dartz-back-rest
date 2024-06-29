import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'pgsqldb',
  connector: process.env.PGCONNECTOR,
  host: process.env.PGHOST,
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  timezone: "UTC",
};

@lifeCycleObserver('datasource')
export class PgsqldbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'pgsqldb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.pgsqldb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
 