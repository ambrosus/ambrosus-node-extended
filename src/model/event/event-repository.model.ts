export interface IEventRepository {
  bundleStubId: string;
}

export class EventRepository implements IEventRepository {
  public bundleStubId: string;
}
