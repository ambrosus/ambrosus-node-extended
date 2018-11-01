import { injectable } from 'inversify';
import { BundleContent } from './bundle-content.model';
import { BundleMetaData } from './bundle-metadata.model';

export interface IBundle {
  _id: string;
  bundleId: string;
  entries: object;
  content: BundleContent;
  metadata: BundleMetaData;
}

@injectable()
export class Bundle implements IBundle {
  public _id: string;
  public bundleId;
  public entries: object;
  public content: BundleContent;
  public metadata: BundleMetaData;
}
