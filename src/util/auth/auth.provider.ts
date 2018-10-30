import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { interfaces } from 'inversify-express-utils';

import { TYPE } from '../../constant';
import { ILogger } from '../../interface/logger.inferface';
import { Account, UserPrincipal } from '../../model';
import { AccountService } from '../../service/account.service';
import { AuthService } from '../../service/auth.service';

@injectable()
export class AMBAuthProvider implements interfaces.AuthProvider {
  @inject(TYPE.AuthService)
  private authService: AuthService;

  @inject(TYPE.AccountService)
  private accountService: AccountService;

  @inject(TYPE.LoggerService)
  private logger: ILogger;

  public async getUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<interfaces.Principal> {
    const authorization = req.header('authorization');
    this.logger.debug(`begin auth`);

    const user = new UserPrincipal();
    try {
      const authToken = this.authService.getAuthToken(authorization);
      const account: Account = await this.accountService.getAccountForAuth(authToken.createdBy);
      user.authToken = authToken;
      user.account = account;
      this.logger.debug(`auth succeeded`);
    } catch (error) {
      this.logger.warn(`auth failed: ${error}`);
    }

    return user;
  }
}
