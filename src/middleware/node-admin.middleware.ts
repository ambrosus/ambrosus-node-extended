import * as express from 'express';
import { inject, injectable, interfaces } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';

import { TYPE } from '../constant/types';
import { AuthenticationError, UserPrincipal } from '../model';
import { LoggerService } from '../service/logger.service';

@injectable()
export class NodeAdminMiddleware extends BaseMiddleware {
  @inject(TYPE.LoggerService)
  private readonly logger: LoggerService;

  public handler(req: express.Request, res: express.Response, next: express.NextFunction) {
    this.logger.debug('Begin NodeAdminMiddleware');

    const user = this.httpContext.user as UserPrincipal;
    
    if (!user.hasPermission('super_account')) {
      throw new AuthenticationError('Unauthorized access');
    }

    return next();
  }
}
