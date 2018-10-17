import { Request } from 'express';
import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  httpGet,
  requestParam,
  httpPost
} from 'inversify-express-utils';

import { TYPES } from '../constant/types';
import { IAnalytics } from '../interface/analytics.interface';
import { Account, APIQuery, APIResult } from '../model';
import { AccountService } from '../service/account.service';

@controller('/account', TYPES.AuthorizeMiddleWare)
export class AccountController extends BaseHttpController implements IAnalytics {
  constructor(@inject(TYPES.AccountService) private accountService: AccountService) {
    super();
  }

  @httpGet('/:address')
  public get(@requestParam('address') address: string): Promise<Account> {
    return this.accountService.getAccount(address);
  }

  @httpPost('/query')
  public async query(req: Request): Promise<APIResult> {
    return this.accountService.getQueryResults(APIQuery.create(req));
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
}
