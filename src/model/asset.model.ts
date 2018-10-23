import { injectable } from 'inversify';
import { AssetContent } from './asset-content.model';
import { AssetMetaData } from './asset-meta-data.model';

export interface IAsset {
  _id: string;
  assetId: string;
  content: AssetContent;
  metadata: AssetMetaData;
}

@injectable()
export class Asset implements IAsset {
  public _id: string;
  public assetId: string;
  public content: AssetContent;
  public metadata: AssetMetaData;

  constructor() {}
}
