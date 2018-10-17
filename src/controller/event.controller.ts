import { Request } from 'express';
import { inject } from 'inversify';
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  requestParam
} from 'inversify-express-utils';

import { TYPES } from '../constant/types';
import { IAnalytics } from '../interface/analytics.interface';
import { EventService } from '../service/event.service';
import { Event, APIQuery, APIResult } from '../model';

@controller('/event', TYPES.AuthorizeMiddleWare)
export class EventController extends BaseHttpController implements IAnalytics {
  constructor(@inject(TYPES.EventService) private eventService: EventService) {
    super();
  }

  @httpGet('/:eventId')
  public get(@requestParam('eventId') eventId: string): Promise<Event> {
    return this.eventService.getEvent(eventId);
  }

  @httpPost('/query')
  public async query(req: Request): Promise<APIResult> {
    return this.eventService.getQueryResults(APIQuery.create(req));
  }

  @httpGet('/count')
  public async getCount(): Promise<any> {
    return this.eventService.getCountTotal();
  }

  @httpGet('/count/mtd')
  public async getCountByMonthToDate(): Promise<any> {
    return this.eventService.getCountByMonthToDate();
  }

  @httpGet('/count/date/:date')
  public async getCountByDate(@requestParam('date') date: string): Promise<any> {
    return this.eventService.getCountByDate(date);
  }

  @httpGet('/count/daterange/:start/:end')
  public async getCountByDateRange(
    @requestParam('start') start: string,
    @requestParam('end') end: string
  ): Promise<any> {
    return this.eventService.getCountByDateRange(start, end);
  }

  @httpGet('/count/rolling/hours/:hours')
  public async getCountByRollingHours(@requestParam('hours') num: number): Promise<any> {
    return this.eventService.getCountByRollingHours(num);
  }

  @httpGet('/count/rolling/days/:days')
  public async getCountByRollingDays(@requestParam('days') num: number): Promise<any> {
    return this.eventService.getCountByRollingDays(num);
  }
}
