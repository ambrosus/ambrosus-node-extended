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
import { NotFoundResult } from 'inversify-express-utils/dts/results';

@controller('/event', TYPES.AuthorizedMiddleware)
export class EventController extends BaseHttpController {
  constructor(@inject(TYPES.EventService) private eventService: EventService) {
    super();
  }

  @httpGet('/')
  public async getEvents(req: Request): Promise<APIResult | NotFoundResult> {
    const result = await this.eventService.getEvents(APIQuery.fromRequest(req));
    if (!result.results.length) {
      return this.notFound();
    }
    return result;
  }

  @httpGet('/:eventId')
  public async get(@requestParam('eventId') eventId: string): Promise<Event | NotFoundResult> {
    const result = await this.eventService.getEvent(eventId);
    if (!result) {
      return this.notFound();
    }
    return result;
  }

  @httpPost('/query')
  public async query(req: Request): Promise<APIResult | NotFoundResult> {
    const result = await this.eventService.getEvents(APIQuery.fromRequest(req));
    if (!result.results.length) {
      return this.notFound();
    }
    return result;
  }

  @httpPost('/latest/type')
  public async latestType(req: Request): Promise<APIResult | NotFoundResult> {
    const assets = getParamValue(req, 'assets');
    const type = getParamValue(req, 'type');

    const result = await this.eventService.getLatestAssetEventsOfType(
      assets,
      type,
      APIQuery.fromRequest(req)
    );
    if (!result.results.length) {
      return this.notFound();
    }
    return result;
  }
}
