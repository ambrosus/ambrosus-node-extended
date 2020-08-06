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

import {
  ValidationError,
  PermissionError
} from '../errors';

import { AssetService } from '../service/asset.service';
import { EventContent } from '../model/event/event-content.model';
import { EventIdData } from '../model/event/event-iddata.model';
import { EventMetaData } from '../model/event/event-metadata.model';

import { AccountService } from '../service/account.service';
import { OrganizationService } from '../service/organization.service';
import { CompositionSettingsList } from 'twilio/lib/rest/video/v1/compositionSettings';

const maxAccessLevel = 1000;

@injectable()
export class EventService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.EventRepository) private readonly eventRepository: EventRepository,
    @inject(TYPE.AssetService) private assetService: AssetService,
    @inject(TYPE.AccountService) private accountService: AccountService,
    @inject(TYPE.OrganizationService) private organizationService: OrganizationService
  ) { }

  public getEventExists(eventId: string) {
    return this.eventRepository.existsOR({ eventId }, 'eventId');
  }

  // (this.user && this.user.accessLevel) || 0

  public getEvents(apiQuery: APIQuery): Promise<MongoPagedResult> {
    return this.eventRepository.queryEvents(apiQuery, maxAccessLevel);
  }

  public getEventsOld(apiQuery: APIQuery): Promise<any> {
    return this.eventRepository.queryEventsOld(apiQuery, maxAccessLevel);
  }

  public searchEvents(apiQuery: APIQuery): Promise<MongoPagedResult> {
    return this.eventRepository.searchEvents(apiQuery, maxAccessLevel);
  }

  public getEventDistinctField(field: string): Promise<any> {
    return this.eventRepository.distinct(field);
  }

  public getEvent(eventId: string): Promise<Event> {
    const apiQuery = new APIQuery({ eventId });
    return this.eventRepository.queryEvent(apiQuery, maxAccessLevel);
  }

  public async checkEventDecryption(event: Event): Promise<Event> {
    const result = event;

    for (let i = 0; i < event.content.data.length; i = i + 1) {
      if (event.content.data[i]['encrypted'] !== undefined) {
        if (this.user.accessLevel >= event.content.idData.accessLevel) {
          const decryptedData = await this.organizationService.decrypt(event.content.data[i]['encrypted'], result.organizationId);

          result.content.data[i] = JSON.parse(decryptedData);
        } else {
          event.content.data[i]['encrypted'] = `accessLevel.${event.content.idData.accessLevel}.required`;
        }

        result.content.data[i]['encryption'] = 'on';
      } else {
        result.content.data[i]['encryption'] = 'off';
      }
    }

    return result;
  }

  public async checkEventsDecryptionPaged(data: MongoPagedResult): Promise<MongoPagedResult> {
    const eventList = data['results'];

    if (eventList === undefined) {
      return data;
    }

    for (let i = 0; i < eventList.length; i = i + 1) {
      eventList[i] = await this.checkEventDecryption(eventList[i]);
    }

    const result = data;

    result['results'] = eventList;

    return result;
  }

  public async checkEventsDecryptionList(data: any[]): Promise<any[]> {
    const eventList = data;

    if (eventList === undefined) {
      return data;
    }

    for (let i = 0; i < eventList.length; i = i + 1) {
      eventList[i] = await this.checkEventDecryption(eventList[i]);
    }

    return eventList;
  }

  public stripRaw(data: any[]): any[] {
    const eventData = data;

    if (eventData === undefined) {
      return data;
    }

    for (let dataItem of eventData) {
      if (dataItem['raws'] !== undefined) {
        delete dataItem['raws'];
      }
    }

    return eventData;
  }

  public stripRaws(data: any[]): any[] {
    const eventList = data;

    if (eventList === undefined) {
      return data;
    }

    if (eventList.length > 1) {
      for (let eventItem of eventList) {
        if (eventItem['content']['data'] !== undefined) {
          eventItem['content']['data'] = this.stripRaw(eventItem['content']['data']);
        }
      }
    }

    return eventList;
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

    const creator = await this.accountService.getAccount(createdBy);
    if (!creator) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    const event = new Event();
    event.eventId = eventId;

    event.organizationId = creator.organization;

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

    if (accessLevel > 0) {
      for (let i = 0; i < data.length; i = i + 1) {
        const encryptedData = await this.organizationService.encrypt(JSON.stringify(data[i]), creator.organization);

        const dataType = data[i]['type'];

        data[i] = {
         type: dataType,
         encrypted: encryptedData,
        };
      }
    }

    event.content.data = data;

    await this.eventRepository.create(event);
  }
}
