import {createLogger, format, transports} from 'winston';
import {injectable, BindingScope} from '@loopback/core';
import {Pool} from 'pg';
import {PostgresTransport} from './PostgresTransport';

const loggingDbConfig = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
};

const loggingPool = new Pool(loggingDbConfig);

@injectable({scope: BindingScope.SINGLETON})
export class Logger {
  private loggerInstance: any;

  constructor() {
    this.initializeLogger();
  }

  private initializeLogger() {
    this.loggerInstance = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.timestamp(),
            format.printf(({ timestamp, level, message }) => {
              return `${timestamp} ${level}: ${message}`;
            })
          )
        }),
        new PostgresTransport({pool: loggingPool}),
      ],
    });
  }

  log(level: string, type: string, method: string, url: string, statusCode: number | null, duration: number | null, message: string, meta: any = {}) {
    this.loggerInstance.log({level, type, method, url, statusCode, duration, message, meta});
  }

  info(type: string, method: string, url: string, statusCode: number | null, duration: number | null, message: string, meta: any = {}) {
    this.log('info', type, method, url, statusCode, duration, message, meta);
  }

  warn(type: string, method: string, url: string, statusCode: number | null, duration: number | null, message: string, meta: any = {}) {
    this.log('warn', type, method, url, statusCode, duration, message, meta);
  }

  error(type: string, method: string, url: string, statusCode: number | null, duration: number | null, message: string, meta: any = {}) {
    this.log('error', type, method, url, statusCode, duration, message, meta);
  }

  get logger() {
    return this.loggerInstance;
  }
}
