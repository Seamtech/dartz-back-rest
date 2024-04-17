import {
    MiddlewareSequence,
    RequestContext,
    SequenceHandler,
  } from '@loopback/rest';
  
  export class MySequence extends MiddlewareSequence implements SequenceHandler {
    async handle(context: RequestContext) {

      await super.handle(context);
    }
  }