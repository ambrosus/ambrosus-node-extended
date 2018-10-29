export interface IBundleIdData {
  createdBy: string;
  entriesHash: string;
  timestamp: number;
}

export class BundleIdData implements IBundleIdData {
  public createdBy: string;
  public entriesHash: string;
  public timestamp: number;
}
