import { Request } from 'express';
import { inject } from 'inversify';
import { Route } from 'tsoa';
import {
  BaseHttpController,
  controller,
  httpGet,
  requestParam,
  queryParam,
  httpPost
} from 'inversify-express-utils';

import { TYPES } from '../constant/types';
import { IAnalytics } from '../interface/analytics.interface';
import { Account, APIQuery, APIResult } from '../model';
import { AccountService } from '../service/account.service';

@Route('/account')
@controller('/account', TYPES.AuthorizeMiddleware)
export class AccountController extends BaseHttpController implements IAnalytics {
  constructor(@inject(TYPES.AccountService) private accountService: AccountService) {
    super();
  }

  @httpPost('/query')
  public async query(req: Request): Promise<APIResult> {
    return this.accountService.getQueryResults(APIQuery.fromRequest(req));
  }

  @httpGet('/count')
  public async getCount(): Promise<any> {
    return this.accountService.getCountTotal();
  }

  @httpGet('/count/mtd')
  public async getCountByMonthToDate(): Promise<any> {
    return this.accountService.getCountByMonthToDate();
  }

  @httpGet('/count/date/:date')
  public async getCountByDate(@requestParam('date') date: string): Promise<any> {
    return this.accountService.getCountByDate(date);
  }

  @httpGet('/count/daterange/:start/:end')
  public async getCountByDateRange(
    @requestParam('start') start: string,
    @requestParam('end') end: string
  ): Promise<any> {
    return this.accountService.getCountByDateRange(start, end);
  }

  @httpGet('/count/rolling/hours/:hours')
  public async getCountByRollingHours(@requestParam('hours') num: number): Promise<any> {
    return this.accountService.getCountByRollingHours(num);
  }

  @httpGet('/count/rolling/days/:days')
  public async getCountByRollingDays(@requestParam('days') num: number): Promise<any> {
    return this.accountService.getCountByRollingDays(num);
  }

  @httpGet('/')
  public getAccounts(req: Request): Promise<APIResult> {
    return this.accountService.getAccounts(APIQuery.fromRequest(req));
  }

  @httpGet('/:address')
  public getAccount(@requestParam('address') address: string): Promise<Account> {
    return this.accountService.getAccount(address);
  }
}
