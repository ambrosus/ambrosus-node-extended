import * as express from 'express';

import { AuthService } from '../service/auth.service';
import { LoggerService } from '../service/logger.service';

export const authorizeMiddlewareFactory = (
  authService: AuthService,
  logger: LoggerService
) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (process.env.NODE_ENV === 'dev') {
      return next();
    }
    const authorization = req.header('authorization');

    if (authorization && authorization.split(' ')[0] === 'AMB_TOKEN') {
      const token = authorization.split(' ')[1];

      if (authService.isAuthorized(token)) {
        logger.info(`Token ${token} authorized`);
        return next();
      }
      logger.warn('Token not authorized');
      res.status(401).end('Unauthorized');
    } else {
      res.status(401).end('Unauthorized');
    }
  };
};
