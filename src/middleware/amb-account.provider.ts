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
      const authToken: AuthToken = this.authService.getAuthToken(authorization);
      const account: AccountDetail = await this.accountService.getAccountForAuth(
        authToken.createdBy
      );
      const organization = await this.organizationService.getOrganizationForAuth(
        account.organization
      );

      user.authToken = authToken;
      user.account = account;
      user.organization = organization;

      Sentry.configureScope(scope => {
        scope.setUser({
          organizationId: account.organization,
          address: account.address,
          valid: authToken.validUntil,
        });
      });
      this.logger.debug(`auth succeeded`);
    } catch (error) {
      this.logger.warn(`auth failed: ${error}`);
    }

    return user;
  }
}
