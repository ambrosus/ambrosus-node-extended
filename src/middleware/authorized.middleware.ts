import * as express from 'express';
import { inject, injectable } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';

import { TYPES } from '../constant/types';
import { AuthenticationError } from '../error';
import { IPrincipal, Principal } from '../model';
import { LoggerService } from '../service/logger.service';

@injectable()
export class AuthorizedMiddleware extends BaseMiddleware {
  @inject(TYPES.LoggerService)
  private readonly logger: LoggerService;

  public handler(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (process.env.NODE_ENV === 'dev') {
      return next();
    }

    const user = this.httpContext.user as Principal;

    if (!user.isAuthorized()) {
      this.logger.info(`Anonymous => ${req.url}`);
      throw new AuthenticationError('Unauthorized');
    }
    this.logger.info(`${user.account.address} => ${req.url}`);
    return next();
  }
}
