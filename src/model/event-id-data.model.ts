export interface IEventIdData {
  assetId: string;
  createdBy: string;
  accessLevel: number;
  timestamp: number;
}

export class EventIdData implements IEventIdData {
  public assetId: string;
  public createdBy: string;
  public accessLevel: number;
  public timestamp: number;

  constructor() {}
}
