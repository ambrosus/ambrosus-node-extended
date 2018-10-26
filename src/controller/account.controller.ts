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
import { NotFoundResult } from 'inversify-express-utils/dts/results';

@controller('/account', TYPES.AuthorizedMiddleware)
export class AccountController extends BaseHttpController {
  @inject(TYPES.AccountService)
  private accountService: AccountService;

  constructor() {
    super();
  }

  @httpGet('/')
  public async getAccounts(req: Request): Promise<APIResult | NotFoundResult> {
    const result = await this.accountService.getAccounts(APIQuery.fromRequest(req));
    if (!result.results.length) {
      return this.notFound();
    }
    return result;
  }

  @httpGet('/:address')
  public async getAccount(
    @requestParam('address') address: string
  ): Promise<Account | NotFoundResult> {
    const result = await this.accountService.getAccount(address);
    if (!result) {
      return this.notFound();
    }
    return result;
  }

  @httpPost('/query')
  public async queryAccounts(req: Request): Promise<APIResult | NotFoundResult> {
    const result = await this.accountService.getAccounts(APIQuery.fromRequest(req));
    if (!result.results.length) {
      return this.notFound();
    }
    return result;
  }
}
