import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, requestParam } from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse } from '../model';
import { EventService } from '../service/event.service';
import { getParamValue } from '../util';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';

@controller(
  '/event',
  MIDDLEWARE.Context,
  authorize()
)
export class EventController extends BaseController {

  constructor(
    @inject(TYPE.EventService) private eventService: EventService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet('/')
  public async getEvents(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const result = await this.eventService.getEvents(APIQuery.fromRequest(req));
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet('/:eventId')
  public async getEvent(
    @requestParam('eventId') eventId: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.eventService.getEvent(eventId);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet('/exists/:eventId')
  public async getEventExists(
    @requestParam('eventId') eventId: string,
    req: Request, res: Response, next: NextFunction
  ): Promise<APIResponse> {
    try {
      const result = await this.eventService.getEventExists(eventId);
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpPost('/query')
  public async queryEvents(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const result = await this.eventService.getEvents(APIQuery.fromRequest(req));
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpPost('/search')
  public async search(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const result = await this.eventService.searchEvents(APIQuery.fromRequest(req));
      return APIResponse.fromMongoPagedResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpGet('/lookup/types')
  public async getEventTypes(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const result = await this.eventService.getEventDistinctField('content.data.type');
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }

  @httpPost('/latest/type')
  public async latestType(req: Request, res: Response, next: NextFunction): Promise<APIResponse> {
    try {
      const assets = getParamValue(req, 'assets');
      const type = getParamValue(req, 'type');
      const result = await this.eventService.getLatestAssetEventsOfType(
        assets,
        type,
        APIQuery.fromRequest(req)
      );
      return APIResponse.fromSingleResult(result);
    } catch (err) {
      next(err);
    }
  }
}
