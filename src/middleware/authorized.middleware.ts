import * as express from 'express';
import { inject, injectable, interfaces } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';

import { TYPES } from '../constant/types';
import { AuthenticationError, UserPrincipal } from '../model';
import { LoggerService } from '../service/logger.service';

@injectable()
export class AuthorizedMiddleware extends BaseMiddleware {
  @inject(TYPES.LoggerService)
  private readonly logger: LoggerService;

  // constructor(test: string) {
  //   console.log('HERERERE');
  //   super();
  // }
  public handler(req: express.Request, res: express.Response, next: express.NextFunction) {
    this.logger.debug('Begin AuthorizedMiddleware');

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
