import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { interfaces } from 'inversify-express-utils';

import { TYPES } from '../../constant';
import { Account, Principal } from '../../model';
import { AccountService } from '../../service/account.service';
import { AuthService } from '../../service/auth.service';

@injectable()
export class AMBAuthProvider implements interfaces.AuthProvider {
  @inject(TYPES.AuthService)
  private authService: AuthService;
  @inject(TYPES.AccountService)
  private accountService: AccountService;

  public async getUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<interfaces.Principal> {
    const authorization = req.header('authorization');
    const authToken = this.authService.getAuthToken(authorization);
    if (authToken) {
      const account: Account = await this.accountService.getAccount(authToken.createdBy);
      return new Principal(account, authToken);
    }
    return new Principal(undefined);
  }
}
