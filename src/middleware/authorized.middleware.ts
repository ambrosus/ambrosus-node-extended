import * as express from 'express';
import { inject, injectable, interfaces } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';

import { TYPE } from '../constant/types';
import { APIResponseMeta, UserPrincipal } from '../model';
import { LoggerService } from '../service/logger.service';
import * as HttpStatus from 'http-status-codes';

@injectable()
export class AuthorizedMiddleware extends BaseMiddleware {
  @inject(TYPE.LoggerService)
  private readonly logger: LoggerService;

  public handler(req: express.Request, res: express.Response, next: express.NextFunction) {
    this.logger.debug('Begin AuthorizedMiddleware');

    const user = this.httpContext.user as UserPrincipal;

    if (!user || !user.isAuthorized()) {
      this.logger.debug(`Unauthorized login attempt => ${req.url}`);
      this.logger.debug(`Token `);
      const meta: APIResponseMeta = new APIResponseMeta(HttpStatus.UNAUTHORIZED);
      meta.error_type = 'AuthenticationError';
      meta.error_message = `Unauthorized ${user ? user.notAuthorizedReason() : ''}`;

      return res.status(meta.code).json({ meta });
    }

    this.bind<UserPrincipal>(TYPE.UserPrincipal).toDynamicValue(
      (context: interfaces.Context) => user
    );

    this.logger.debug(`${user.address}(${user.accessLevel}) => ${req.url}`);

    return next();
  }
}
