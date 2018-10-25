import { Request } from 'express';
import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  requestParam,
} from 'inversify-express-utils';

import { TYPES } from '../constant/types';
import { Account, APIQuery, APIResult } from '../model';
import { AccountService } from '../service/account.service';

@controller('/account', TYPES.AuthorizedMiddleware)
export class AccountController extends BaseHttpController {
  constructor(@inject(TYPES.AccountService) private accountService: AccountService) {
    super();
  }

  @httpGet('/')
  public getAccounts(req: Request): Promise<APIResult> {
    return this.accountService.getAccounts(APIQuery.fromRequest(req));
  }

  @httpGet('/:address')
  public getAccount(@requestParam('address') address: string): Promise<Account> {
    return this.accountService.getAccount(address);
  }

  @httpPost('/query')
  public queryAccounts(req: Request): Promise<APIResult> {
    return this.accountService.getAccounts(APIQuery.fromRequest(req));
  }
}
