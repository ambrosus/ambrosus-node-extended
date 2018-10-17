import { injectable } from 'inversify';

export interface IAPIResult {
  results: any[];
  hasPrevious: boolean;
  previous: string;
  hasNext: boolean;
  next: string;
}

@injectable()
export class APIResult implements IAPIResult {
  constructor(
    public results: any[],
    public hasPrevious: boolean,
    public previous: string,
    public hasNext: boolean,
    public next: string
  ) {}
}
