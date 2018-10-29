import { BundleIdData } from './bundle-iddata.model';

export interface IBundleContent {
  signature: string;
  idData: BundleIdData;
}

export class BundleContent implements IBundleContent {
  public signature: string;
  public idData: BundleIdData;
}
