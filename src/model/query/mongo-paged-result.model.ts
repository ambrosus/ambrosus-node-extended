import { injectable } from 'inversify';

export interface IMongoPagedResult {
  results: any[];
  hasPrevious: boolean;
  previous: string;
  hasNext: boolean;
  next: string;
}

@injectable()
export class MongoPagedResult implements IMongoPagedResult {
  public results: any[];
  public hasPrevious: boolean;
  public previous: string;
  public hasNext: boolean;
  public next: string;
}
