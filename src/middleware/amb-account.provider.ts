/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
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

import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { interfaces } from 'inversify-express-utils';

import { TYPE } from '../constant';
import { ILogger } from '../interface/logger.inferface';
import { Account, UserPrincipal, AuthToken, AccountDetail } from '../model';
import { AccountService } from '../service/account.service';
import { OrganizationService } from '../service/organization.service';
import { AuthService } from '../service/auth.service';
import * as Sentry from '@sentry/node';

@injectable()
export class AMBAccountProvider implements interfaces.AuthProvider {
  @inject(TYPE.AuthService)
  private authService: AuthService;

  @inject(TYPE.AccountService)
  private accountService: AccountService;

  @inject(TYPE.OrganizationService)
  private organizationService: OrganizationService;

  @inject(TYPE.LoggerService)
  private logger: ILogger;

  public async getUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<interfaces.Principal> {
    const authorization = req.header('authorization');
    if (!authorization) {
      this.logger.debug('No authorization header found');
      return undefined;
    }
    this.logger.debug(`begin auth`);

    const user = new UserPrincipal();
    try {
      const userScope = {};
      user.authToken = this.authService.getAuthToken(authorization);

      if (user.authToken && user.authToken.createdBy) {
        user.account = await this.accountService.getAccountForAuth(user.authToken.createdBy);

        userScope['token:validUntil'] = user.authToken.validUntil;
        userScope['token:createdBy'] = user.authToken.createdBy;
      }
      if (user.account && user.account.organization) {
        user.organization = await this.organizationService.getOrganizationForAuth(
          user.account.organization
        );
        userScope['account:address'] = user.account.address;
        userScope['organization:id'] = user.account.organization;
      }

      if (user.organization) {
        userScope['organization:title'] = user.organization.title;
      }
      Sentry.configureScope(scope => {
        scope.setUser(userScope);
      });
      this.logger.debug(`auth succeeded`);
    } catch (error) {
      this.logger.warn(`auth failed: ${error}`);
    }

    return user;
  }
}
