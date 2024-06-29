import {Middleware, MiddlewareContext} from '@loopback/rest';
import {Next} from '@loopback/core';
import cors from 'cors';

const corsMiddleware: Middleware = async (requestCtx: MiddlewareContext, next: Next) => {
  const {request, response} = requestCtx;

  const corsOptions = {
    origin: '*', // Customize your origin settings here
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  try {
    await new Promise<void>((resolve, reject) => {
      cors(corsOptions)(request, response, (err: any) => {
        if (err) {
          reject(err);
        } else {
          console.log('Ran CORS middleware');
          resolve();
        }
      });
    });
    next();
  } catch (err) {
throw err;
  }
};

export {corsMiddleware};
