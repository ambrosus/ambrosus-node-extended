import { injectable } from 'inversify';
import { AssetContent } from './asset-content.model';
import { AssetMetaData } from './asset-metadata.model';
import { AssetRepository } from './asset-repository.model';

export interface IAsset {
  _id: string;
  assetId: string;
  content: AssetContent;
  metadata: AssetMetaData;
  repository: AssetRepository;
}

@injectable()
export class Asset implements IAsset {
  public _id: string;
  public assetId: string;
  public content: AssetContent;
  public metadata: AssetMetaData;
  public repository: AssetRepository;
}
