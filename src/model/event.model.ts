import { injectable } from 'inversify';

export interface IEvent {
  _id?: string;
  eventId: string;
}

@injectable()
export class Event implements IEvent {
  constructor(
    public eventId: string,
    public _id?: string
  ) {}
}
