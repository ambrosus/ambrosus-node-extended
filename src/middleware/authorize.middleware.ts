import { Request, Response, NextFunction } from 'express';
import { PermissionError } from '../errors';
import { iocContainer } from '../inversify.config';
import { TYPE } from '../constant/types';
import { UserPrincipal } from '../model';

export const authorize = (...args) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user: UserPrincipal = iocContainer.get<UserPrincipal>(TYPE.UserPrincipal);

      if (!user || !user.isAuthorized()) {
        throw new PermissionError({ reason: 'Unauthorized' });
      }

      if (args && args.length && !user.hasPermissions(args)) {
        throw new PermissionError({ reason: 'Unauthorized' });
      }

      next();
    } catch (e) {
      next(e);
    }
  };
};
