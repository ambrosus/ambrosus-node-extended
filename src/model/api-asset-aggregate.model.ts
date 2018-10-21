import { Request } from 'express';
import { injectable } from 'inversify';
import { IAPIPagination } from './api-pagination.model';

export interface IAPIAssetAggregate {
  collection: string;
  stepMatch;
  stepGroup;
  stepProject;
  pipeline: object;
}

@injectable()
export class APIAssetAggregate implements IAPIAssetAggregate, IAPIPagination {
  public static create(req: Request) {
    const apiAssetAgg = new APIAssetAggregate();
    apiAssetAgg.assets = req.body.assets;
    apiAssetAgg.aggregateType = req.body.type;
    apiAssetAgg.limit = req.body.limit;
    apiAssetAgg.next = req.body.next;
    apiAssetAgg.previous = req.body.previous;

    apiAssetAgg.stepMatch['$match']['content.data.type'] = req.body.type;

    console.log(req.body.asset);

    if (req.body.assets) {
      apiAssetAgg.stepMatch['$match']['content.idData.assetId'] = {
        '$in': req.body.assets,
      };
    }

    return apiAssetAgg;
  }

  public collection;
  public aggregateType;
  public assets;
  public limit;
  public next;
  public previous;
  public paginationField;
  public stepMatch;
  public stepGroup;
  public stepProject;

  get pipeline(): any[] {
    return [this.stepMatch, this.stepGroup, this.stepProject];
  }

  constructor() {
    this.stepMatch = { $match: {} };
    this.stepGroup = {
      $group: {
        _id: '$content.idData.assetId',
        doc: {
          $first: '$$ROOT',
        },
      },
    };

    this.stepProject = {
      $project: {
        _id: 0.0,
        assetId: '$_id',
        eventId: '$doc.eventId',
        content: '$doc.content',
        metadata: '$doc.metadata',
      },
    };
  }
}
