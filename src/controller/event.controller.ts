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
import { IAnalytics } from '../interface/analytics.interface';
import { APIAssetAggregate, APIQuery, APIResult, Event } from '../model';
import { EventService } from '../service/event.service';

@controller('/event', TYPES.AuthorizedMiddleware)
export class EventController extends BaseHttpController implements IAnalytics {
  constructor(@inject(TYPES.EventService) private eventService: EventService) {
    super();
  }

  @httpPost('/query')
  public query(req: Request): Promise<APIResult> {
    return this.eventService.getQueryResults(APIQuery.fromRequest(req));
  }

  @httpPost('/latest/type')
  public latestType(req: Request): Promise<APIResult> {
    return this.eventService.getLatestType(APIAssetAggregate.fromRequest(req));
  }

  @httpGet('/count')
  public getCount(): Promise<any> {
    return this.eventService.getCountTotal();
  }

  @httpGet('/count/mtd')
  public getCountByMonthToDate(): Promise<any> {
    return this.eventService.getCountByMonthToDate();
  }

  @httpGet('/count/date/:date')
  public getCountByDate(@requestParam('date') date: string): Promise<any> {
    return this.eventService.getCountByDate(date);
  }

  @httpGet('/count/daterange/:start/:end')
  public getCountByDateRange(
    @requestParam('start') start: string,
    @requestParam('end') end: string
  ): Promise<any> {
    return this.eventService.getCountByDateRange(start, end);
  }

  @httpGet('/count/rolling/hours/:hours')
  public getCountByRollingHours(@requestParam('hours') num: number): Promise<any> {
    return this.eventService.getCountByRollingHours(num);
  }

  @httpGet('/count/rolling/days/:days')
  public getCountByRollingDays(@requestParam('days') num: number): Promise<any> {
    return this.eventService.getCountByRollingDays(num);
  }

  @httpGet('/')
  public getEvents(req: Request): Promise<APIResult> {
    return this.eventService.getEvents(APIQuery.fromRequest(req));
  }

  @httpGet('/:eventId')
  public get(@requestParam('eventId') eventId: string): Promise<Event> {
    return this.eventService.getEvent(eventId);
  }
}
