import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { EventRepository } from '../database/repository';
import { APIQuery, Event, MongoPagedResult, UserPrincipal } from '../model';

@injectable()
export class EventService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.EventRepository) private readonly eventRepository: EventRepository
  ) { }

  public getEventExists(eventId: string) {
    return this.eventRepository.existsOR({ eventId }, 'eventId');
  }

  public getEvents(apiQuery: APIQuery): Promise<MongoPagedResult> {
    return this.eventRepository.queryEvents(apiQuery, this.user.accessLevel);
  }

  public searchEvents(apiQuery: APIQuery): Promise<MongoPagedResult> {
    return this.eventRepository.searchEvents(apiQuery, this.user.accessLevel);
  }

  public getEventDistinctField(field: string): Promise<any> {
    return this.eventRepository.distinct(field);
  }

  public getEvent(eventId: string): Promise<Event> {
    const apiQuery = new APIQuery({ eventId });
    return this.eventRepository.queryEvent(apiQuery, this.user.accessLevel);
  }

  public async getLatestAssetEventsOfType(
    assets: string[],
    type: string,
    apiQuery: APIQuery
  ): Promise<any> {
    const query = new APIQuery({
      'content.data.type': type,
      'content.idData.assetId': {
        $in: assets,
      },
    });

    const infoEvents = await this.eventRepository.find(query);

    const events = {};
    infoEvents.map((event: any) => {
      const exists = events[event.content.idData.assetId];
      const sameTimestamp = exists && exists.content.idData.timestamp === event.content.idData.timestamp;

      if (!exists ||
        (sameTimestamp && exists._id.toString() < event._id.toString()) ||
        exists.content.idData.timestamp < event.content.idData.timestamp) {
        events[event.content.idData.assetId] = event;
      }
    });

    return Object.keys(events).map(event => events[event]);
  }
}
