export interface IAssetIdData {
  createdBy: string;
  timestamp: number;
  sequenceNumber: number;
}

export class AssetIdData implements IAssetIdData {
  public createdBy: string;
  public timestamp: number;
  public sequenceNumber: number;
}
