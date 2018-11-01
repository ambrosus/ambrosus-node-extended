export interface IBundleMetaData {
  bundleId: string;
  bundleTransactionHash: string;
  bundleUploadTimestamp: number;
  proofBlock: number;
  storagePeriods: number;
}

export class BundleMetaData implements IBundleMetaData {
  public bundleId: string;
  public bundleTransactionHash: string;
  public bundleUploadTimestamp: number;
  public proofBlock: number;
  public storagePeriods: number;
}
