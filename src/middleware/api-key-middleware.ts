import {Request, Response } from '@loopback/rest';
import { NextFunction } from 'express-serve-static-core';

/*export function apiKeyMiddleware(apiKey: string) {
    return function(req: Request, res: Response, next: NextFunction) {
      const clientApiKey = req.headers['x-api-key'];
      if (clientApiKey !== apiKey) {
        res.status(401).send('Unauthorized');
      } else {
        next();
      }
    };
  }*/

