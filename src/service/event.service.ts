import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { EventRepository } from '../database/repository';
import { APIQuery, Event, MongoPagedResult, UserPrincipal } from '../model';

@injectable()
export class EventService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.EventRepository) private readonly eventRepository: EventRepository
  ) {}

  public getEventExists(eventId: string) {
    return this.eventRepository.existsOR({ eventId }, 'eventId');
  }

  public getEvents(apiQuery: APIQuery): Promise<MongoPagedResult> {
    return this.eventRepository.queryEvents(apiQuery, this.user.accessLevel);
  }

  public getEventDistinctField(field: string): Promise<any> {
    return this.eventRepository.distinct(field);
  }

  public getEvent(eventId: string): Promise<Event> {
    const apiQuery = new APIQuery({ eventId });
    return this.eventRepository.queryEvent(apiQuery, this.user.accessLevel);
  }

  public getLatestAssetEventsOfType(
    assets: string[],
    type: string,
    apiQuery: APIQuery
  ): Promise<MongoPagedResult> {
    return this.eventRepository.assetEventsOfType(assets, type, apiQuery);
  }
}
