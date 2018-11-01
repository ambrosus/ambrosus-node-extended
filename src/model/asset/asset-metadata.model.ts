export interface IAssetMetaData {
  bundleId: string;
  bundleTransactionHash: string;
  bundleUploadTimestamp: number;
  entityUploadTimestamp: number;
}

export class AssetMetaData implements IAssetMetaData {
  public bundleId: string;
  public bundleTransactionHash: string;
  public bundleUploadTimestamp: number;
  public entityUploadTimestamp: number;
}
