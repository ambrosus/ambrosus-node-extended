import { inject, injectable } from 'inversify';

import { TYPES } from '../../constant';
import { Event } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class EventRepository extends BaseRepository<Event> {
  constructor(@inject(TYPES.DBClient) protected client: DBClient) {
    super(client, 'events');
  }
}
