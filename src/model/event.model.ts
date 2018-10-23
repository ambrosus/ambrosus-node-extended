import { injectable } from 'inversify';
import { EventContent } from './event-content.model';

export interface IEvent {
  _id: string;
  eventId: string;
  content: EventContent;
}

@injectable()
export class Event implements IEvent {
  public _id: string;
  public eventId: string;
  public content: EventContent;

  constructor() {}
}
