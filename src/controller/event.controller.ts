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
import { APIQuery, APIResult, Event } from '../model';
import { EventService } from '../service/event.service';
import { getParamValue } from '../util/helpers';

@controller('/event', TYPES.AuthorizedMiddleware)
export class EventController extends BaseHttpController {
  constructor(@inject(TYPES.EventService) private eventService: EventService) {
    super();
  }

  @httpGet('/')
  public getEvents(req: Request): Promise<APIResult> {
    return this.eventService.getEvents(APIQuery.fromRequest(req));
  }

  @httpGet('/:eventId')
  public get(@requestParam('eventId') eventId: string): Promise<Event> {
    return this.eventService.getEvent(eventId);
  }

  @httpPost('/query')
  public query(req: Request): Promise<APIResult> {
    return this.eventService.getEvents(APIQuery.fromRequest(req));
  }

  @httpPost('/latest/type')
  public latestType(req: Request): Promise<APIResult> {
    const assets = getParamValue(req, 'assets');
    const type = getParamValue(req, 'type');
    return this.eventService.getLatestAssetEventsOfType(assets, type, APIQuery.fromRequest(req));
  }
}
