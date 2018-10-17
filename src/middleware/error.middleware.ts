import * as express from 'express';

import { LoggerService } from '../service/logger.service';

export const errorMiddlewareFactory = (logger: LoggerService) => {
  return (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.info(process.env.NODE_ENV);

    console.error(err.stack);
    res.status(500).send('Something broke! middleware');
  };
};
