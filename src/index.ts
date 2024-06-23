import * as dotenv from 'dotenv';
import {ApplicationConfig, DartzBackendApplication} from './application';
import {initializeRedis} from './config/redis.config';

dotenv.config();
export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new DartzBackendApplication(options);
  await initializeRedis();
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config: ApplicationConfig = {
    rest: {
      cors: {
        origin: 'http://localhost:3000', // Allow your frontend origin
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        allowedHeaders: 'Content-Type,Authorization',
        credentials: true,
        maxAge: 86400,
      },
      port: +(process.env.PORT ?? 3001),
      host: process.env.HOST,
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
