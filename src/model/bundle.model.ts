import { injectable } from 'inversify';

export interface IBundle {
  _id?: string;
  bundleId: string;
}

@injectable()
export class Bundle implements IBundle {
  constructor(
    public bundleId: string,
    public _id?: string
  ) {}
}
