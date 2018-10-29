import { AssetIdData } from './asset-iddata.model';

export interface IAssetContent {
  signature: string;
  idData: AssetIdData;
}

export class AssetContent implements IAssetContent {
  public signature: string;
  public idData: AssetIdData;
}
