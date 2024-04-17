import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: process.env.PGDBNAME,
  connector: process.env.PGCONNECTOR,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
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
