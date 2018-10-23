export interface IAssetMetaData {
  bundleId: string;
  bundleTransactionHash: string;
}

export class AssetMetaData implements IAssetMetaData {
  public bundleId: string;
  public bundleTransactionHash: string;

  constructor() {}
}
