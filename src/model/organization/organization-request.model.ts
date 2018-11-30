import { Request } from 'express';
import { ValidationSchema } from 'express-validator/check';
import { injectable } from 'inversify';
import web3 = require('web3');
import { getTimestamp } from '../../util';

export interface IOrganizationRequest {
  _id: string;
  address: string;
  title: string;
  email: string;
  message: string;
  createdOn: number;
  refused: boolean;
}

@injectable()
export class OrganizationRequest implements IOrganizationRequest {
  public static fromRequest(req: Request) {
    const organizationRequest = new OrganizationRequest();
    if (undefined !== req.body['title']) {
      organizationRequest.title = req.body.title;
    }
    if (undefined !== req.body['address']) {
      organizationRequest.address = req.body.address;
    }
    if (undefined !== req.body['email']) {
      organizationRequest.email = req.body.email;
    }
    if (undefined !== req.body['message']) {
      organizationRequest.message = req.body.message;
    }
    return organizationRequest;
  }

  public _id: string;
  public address: string;
  public title: string;
  public email: string;
  public message: string;
  public createdOn: number;
  public refused: boolean;

  public setCreationTimestamp() {
    this.createdOn = getTimestamp();
  }
}
