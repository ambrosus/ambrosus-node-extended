/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.io
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Request, Response, NextFunction } from 'express';
import { PermissionError } from '../errors';
import { iocContainer } from '../inversify.config';
import { TYPE } from '../constant/types';
import { UserPrincipal } from '../model';
import { Authorization } from '../constant/enum';

export const authorize = (...args) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = iocContainer.get<UserPrincipal>(TYPE.UserPrincipal);

      if (!user) {
        throw new PermissionError({ reason: 'No such user' });
      }

      if (!user.isAuthorized()) {
        throw new PermissionError({ reason: 'Unauthorized' });
      }

      if (args && args.length && !user.hasPermissions(args)) {
        throw new PermissionError({ reason: 'No permission' });
      }

      next();
    } catch (e) {
      next(e);
    }
  };
};

export const authorizeByType = (authType: Authorization) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {      
      const user = iocContainer.get<UserPrincipal>(TYPE.UserPrincipal);

      if (!user || !user.isAuthorized()) {
        throw new PermissionError({ reason: 'Unauthorized' });
      }

      switch (authType) {
        case Authorization.organization_owner:
            if (!user.isOrganizationOwner()) {
              throw new PermissionError({ reason: 'Organization owner access required.' });
            }
            break;

        default:
            break;
      }

      next();
    } catch (e) {
      next(e);
    }
  };
};
