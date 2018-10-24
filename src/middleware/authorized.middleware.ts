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
    const user = this.httpContext.user as Principal;
    if (!user.isAuthorized()) {
      this.logger.debug(`Anonymous => ${req.url}`);
      throw new AuthenticationError('Unauthorized');
    }
    this.logger.debug(`${user.account.address}(${user.account.accessLevel}) => ${req.url}`);
    return next();
  }
}
