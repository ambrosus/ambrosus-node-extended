import { injectable, interfaces } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';
import { TYPE } from '../constant/types';
import { Request, Response, NextFunction } from 'express';
import { UserPrincipal } from '../model';

@injectable()
export class ContextMiddleware extends BaseMiddleware {

  public handler(req: Request, res: Response, next: NextFunction) {

    const user = this.httpContext.user as UserPrincipal;

    this.bind<UserPrincipal>(TYPE.UserPrincipal)
      .toDynamicValue((context: interfaces.Context) => user);

    return next();
  }
}
