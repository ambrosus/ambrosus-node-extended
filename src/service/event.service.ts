/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { EventRepository } from '../database/repository';
import {
  APIQuery,
  Event,
  MongoPagedResult,
  UserPrincipal
} from '../model';
import { getTimestamp } from '../util';
import { ensureCanCreateEvent } from '../security/access.check';
import { ValidationError } from '../errors';
import { AssetService } from '../service/asset.service';
import { EventContent } from '../model/event/event-content.model';
import { EventIdData } from '../model/event/event-iddata.model';
import { EventMetaData } from '../model/event/event-metadata.model';

@injectable()
export class EventService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.EventRepository) private readonly eventRepository: EventRepository,
    @inject(TYPE.AssetService) private assetService: AssetService
  ) { }

  public getEventExists(eventId: string) {
    return this.eventRepository.existsOR({ eventId }, 'eventId');
  }

  public getEvents(apiQuery: APIQuery): Promise<MongoPagedResult> {    
    return this.eventRepository.queryEvents(apiQuery, (this.user && this.user.accessLevel) || 0);
  }

  public getEventsOld(apiQuery: APIQuery): Promise<any> {
    return this.eventRepository.queryEventsOld(apiQuery, (this.user && this.user.accessLevel) || 0);
  }

  public searchEvents(apiQuery: APIQuery): Promise<MongoPagedResult> {
    return this.eventRepository.searchEvents(apiQuery, (this.user && this.user.accessLevel) || 0);
  }

  public getEventDistinctField(field: string): Promise<any> {
    return this.eventRepository.distinct(field);
  }

  public getEvent(eventId: string): Promise<Event> {
    const apiQuery = new APIQuery({ eventId });
    return this.eventRepository.queryEvent(apiQuery, (this.user && this.user.accessLevel) || 0);
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

  public async createEvent(
    eventId: string,
    assetId: string,
    accessLevel: number,
    timestamp: number,
    createdBy: string,
    dataHash: string,
    signature: string,
    data: object[]
  ) {
    await ensureCanCreateEvent();

    const testAsset = await this.assetService.getAsset(assetId);

    if ((!testAsset) || (testAsset === null)) {
      throw new ValidationError( {reason: `Asset with assetId=${assetId} not found` } );
    }

    const testEvent = await this.getEvent(eventId);

    if (testEvent && (testEvent !== null)) {
      throw new ValidationError( {reason: `Event with eventId=${eventId} already exists` } );
    }

    const event = new Event();
    event.eventId = eventId;

    event.metadata = new EventMetaData();

    event.metadata.bundleId = null;
    event.metadata.bundleUploadTimestamp = getTimestamp();

    event.content = new EventContent();

    event.content.idData = new EventIdData();

    event.content.idData.assetId = assetId;
    event.content.idData.timestamp = timestamp;
    event.content.idData.accessLevel = accessLevel;
    event.content.idData.createdBy = createdBy;
    event.content.idData.dataHash = dataHash;

    event.content.signature = signature;

    event.content.data = data;

    await this.eventRepository.create(event);
  }
}
