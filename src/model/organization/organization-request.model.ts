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

  public static validationSchema(): ValidationSchema {
    return {
      title: {
        in: ['body'],
        optional: true,
        isLength: {
          errorMessage: 'Organization title may not exceed 100 characters',
          options: { max: 100 },
        },
      },
      address: {
        in: ['body'],
        optional: false,
        custom: {
          options: (value, { req, location, path }) => {
            return web3.utils.isAddress(value);
          },
          errorMessage: 'Invalid public key address',
        },
      },
      email: {
        in: ['body'],
        optional: false,
        errorMessage: 'Invalid email format',
        isEmail: true,
      },
      message: {
        in: ['body'],
        optional: true,
        isLength: {
          errorMessage: 'Message may not exceed 1024 characters',
          options: { max: 1024 },
        },
      },
    };
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
