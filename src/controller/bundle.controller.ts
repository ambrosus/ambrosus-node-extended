import { inject } from 'inversify';
import { BaseHttpController, controller, httpGet, requestParam } from 'inversify-express-utils';

import { TYPES } from '../constant/types';
import { IAnalytics } from '../interface/analytics.interface';
import { BundleService } from '../service/bundle.service';
import { Bundle, APIResult } from '../model';

@controller('/bundle', TYPES.AuthorizeMiddleWare)
export class BundleController extends BaseHttpController implements IAnalytics {
  constructor(@inject(TYPES.BundleService) private bundleService: BundleService) {
    super();
  }

  @httpGet('/')
  public getEvents(): Promise<APIResult> {
    return this.bundleService.getBundles();
  }

  @httpGet('/:bundleId')
  public get(@requestParam('bundleId') bundleId: string): Promise<Bundle> {
    return this.bundleService.getBundle(bundleId);
  }

  @httpGet('/count')
  public async getCount(): Promise<any> {
    return this.bundleService.getCountTotal();
  }

  @httpGet('/count/mtd')
  public async getCountByMonthToDate(): Promise<any> {
    return this.bundleService.getCountByMonthToDate();
  }

  @httpGet('/count/date/:date')
  public async getCountByDate(@requestParam('date') date: string): Promise<any> {
    return this.bundleService.getCountByDate(date);
  }

  @httpGet('/count/daterange/:start/:end')
  public async getCountByDateRange(
    @requestParam('start') start: string,
    @requestParam('end') end: string
  ): Promise<any> {
    return this.bundleService.getCountByDateRange(start, end);
  }

  @httpGet('/count/rolling/hours/:hours')
  public async getCountByRollingHours(@requestParam('hours') num: number): Promise<any> {
    return this.bundleService.getCountByRollingHours(num);
  }

  @httpGet('/count/rolling/days/:days')
  public async getCountByRollingDays(@requestParam('days') num: number): Promise<any> {
    return this.bundleService.getCountByRollingDays(num);
  }
}
