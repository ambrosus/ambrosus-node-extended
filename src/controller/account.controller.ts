import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  httpPut,
  requestParam,
  response,
} from 'inversify-express-utils';

import { TYPE, MIDDLEWARE } from '../constant/types';
import { Account, APIQuery, APIResult } from '../model';
import { AccountService } from '../service/account.service';
import { NotFoundResult } from 'inversify-express-utils/dts/results';
import { body } from 'express-validator/check';
import { sanitizeBody } from 'express-validator/filter';

@controller('/account', MIDDLEWARE.Authorized)
export class AccountController extends BaseHttpController {
  constructor(@inject(TYPE.AccountService) private accountService: AccountService) {
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

  @httpGet('/verify/:address')
  public async getAccountExists(
    @requestParam('address') address: string,
    @response() res: Response
  ): Promise<any> {
    const result = await this.accountService.getAccountExists(address);
    return res.status(200).json({ result });
  }

  @httpPost('/query')
  public async queryAccounts(req: Request): Promise<APIResult | NotFoundResult> {
    const result = await this.accountService.getAccounts(APIQuery.fromRequest(req));
    if (!result.results.length) {
      return this.notFound();
    }
    return result;
  }

  @httpPut(
    '/detail/:address',
    body('email')
      .isEmail()
      .normalizeEmail(),
    sanitizeBody('notifyOnReply').toBoolean(),
    MIDDLEWARE.ValidateRequest
  )
  public async updateDetail(
    @requestParam('address') address: string,
    req: Request
  ): Promise<Account | NotFoundResult> {
    const result = await this.accountService.getAccount(address);
    if (!result) {
      return this.notFound();
    }
    return result;
  }
}
