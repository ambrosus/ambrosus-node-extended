import * as express from 'express';
import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';
import { LoggerService } from '../service/logger.service';
import { IPrincipal } from '../model';

import { BaseMiddleware } from 'inversify-express-utils';
import { AuthenticationError } from '../error';

@injectable()
export class AuthorizeMiddleware extends BaseMiddleware {
  @inject(TYPES.LoggerService)
  private readonly logger: LoggerService;

  public handler(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = <IPrincipal>this.httpContext.user;

    if (!user.isAuthorized()) {
      this.logger.info(`Anonymous => ${req.url}`);
      throw new AuthenticationError("Unauthorized");
    }
    this.logger.info(`${user.account.address} => ${req.url}`);
    return next();
  }
}
