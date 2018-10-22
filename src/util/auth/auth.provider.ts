import { injectable, inject } from 'inversify';
import { interfaces } from 'inversify-express-utils';
import { Request, Response, NextFunction } from 'express';
import { Principal, Account } from '../../model';
import { TYPES } from '../../constant';
import { AuthService } from '../../service/auth.service';
import { AccountService } from '../../service/account.service';
import { User } from '../../model/user.model';

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
