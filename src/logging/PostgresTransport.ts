import TransportStream from 'winston-transport';
import {Pool} from 'pg';

interface PostgresTransportOptions extends TransportStream.TransportStreamOptions {
  pool: Pool;
}

class PostgresTransport extends TransportStream {
  pool: Pool;

  constructor(options: PostgresTransportOptions) {
    super(options);
    this.pool = options.pool;
  }

  log(info: any, callback: () => void) {
    setImmediate(() => this.emit('logged', info));

    const query = `
      INSERT INTO dartz.api_logs (level, type, method, url, status_code, duration, message, meta)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [info.level, info.type, info.method, info.url, info.statusCode, info.duration, info.message, JSON.stringify(info.meta || {})];

    this.pool.query(query, values, (err) => {
      if (err) {
        console.error('Error inserting log into database', err);
      }
      callback();
    });
  }
}

export {PostgresTransport};
