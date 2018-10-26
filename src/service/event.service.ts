import { inject, injectable } from 'inversify';
import { TYPES } from '../constant/types';
import { APIQuery, APIResult, Event } from '../model';
import { EventRepository } from '../database/repository';
import { ILogger } from '../interface/logger.inferface';

@injectable()
export class EventService {
  @inject(TYPES.EventRepository)
  public eventRepository: EventRepository;

  @inject(TYPES.LoggerService)
  public logger: ILogger;

  constructor(@inject(TYPES.AccessLevel) private readonly accessLevel: number) {}

  public getEvents(apiQuery: APIQuery): Promise<APIResult> {
    apiQuery.paginationField = 'content.idData.timestamp';
    apiQuery.sortAscending = false;
    return this.eventRepository.query(apiQuery, this.accessLevel);
  }

  public getEvent(eventId: string): Promise<Event> {
    const apiQuery = new APIQuery();
    apiQuery.query = { eventId };
    return this.eventRepository.single(apiQuery, this.accessLevel);
  }

  public getLatestAssetEventsOfType(
    assets: string[],
    type: string,
    apiQuery: APIQuery
  ): Promise<APIResult> {
    apiQuery.paginationField = 'content.idData.timestamp';
    apiQuery.sortAscending = false;
    return this.eventRepository.assetEventsOfType(assets, type, apiQuery);
  }
}
