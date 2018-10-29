import { injectable } from 'inversify';
import { EventContent } from './event-content.model';
import { EventRepository } from './event-repository.model';

export interface IEvent {
  _id: string;
  eventId: string;
  content: EventContent;
  repository: EventRepository;
}

@injectable()
export class Event implements IEvent {
  public _id: string;
  public eventId: string;
  public content: EventContent;
  public repository: EventRepository;
}
