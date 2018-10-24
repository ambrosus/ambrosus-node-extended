import { injectable } from 'inversify';

export interface IBundle {
  _id: string;
  bundleId: string;
}

@injectable()
export class Bundle implements IBundle {
  public _id: string;
  public bundleId;

}
