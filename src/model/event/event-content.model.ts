import { EventIdData } from './event-iddata.model';

export interface IEventContent {
  signature: string;
  idData: EventIdData;
  data: object[];
}

export class EventContent implements IEventContent {
  public signature: string;
  public idData: EventIdData;
  public data: object[];
}