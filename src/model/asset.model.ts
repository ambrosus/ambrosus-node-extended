import { injectable } from 'inversify';

export interface IAsset {
  _id?: string;
  assetId: string;
}

@injectable()
export class Asset implements IAsset {
  constructor(
    public assetId: string,
    public _id?: string
  ) {}
}
