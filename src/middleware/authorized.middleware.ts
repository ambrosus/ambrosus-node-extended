import * as express from 'express';
import { inject, injectable, interfaces } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';

import { TYPES } from '../constant/types';
import { AuthenticationError } from '../error';
import { LoggerService } from '../service/logger.service';
import { UserPrincipal } from '../model/user-principal.model';

@injectable()
export class AuthorizedMiddleware extends BaseMiddleware {
  @inject(TYPES.LoggerService)
  private readonly logger: LoggerService;

  public handler(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = this.httpContext.user as UserPrincipal;

    if (!user.isAuthorized()) {
      this.logger.debug(`Anonymous => ${req.url}`);
      throw new AuthenticationError('Unauthorized');
    }

    this.bind<UserPrincipal>(TYPES.UserPrincipal).toDynamicValue(
      (context: interfaces.Context) => user
    );

    this.logger.debug(`${user.address}(${user.accessLevel}) => ${req.url}`);

    return next();
  }
}
