import { Request } from 'express';
import { injectable } from 'inversify';
import { checkSchema, ValidationSchema } from 'express-validator/check';
import web3 = require('web3');

export interface IOrganizationRequest {
  _id: string;
  address: string;
  title: string;
  email: string;
  message: string;
}

@injectable()
export class OrganizationRequest implements IOrganizationRequest {
  public static fromRequest(req: Request) {
    const orgRequest = new OrganizationRequest();
    orgRequest.title = req.body.title;
    orgRequest.address = req.body.address;
    orgRequest.email = req.body.email;
    orgRequest.message = req.body.message;

    return orgRequest;
  }

  public static validationSchema(): ValidationSchema {
    return {
      title: {
        in: ['body'],
        isLength: {
          errorMessage: 'Organization title may not exceed 200 characters',
          options: { max: 200 },
        },
      },
      address: {
        in: ['body'],
        custom: {
          options: (value, { req, location, path }) => {
            return web3.utils.isAddress(value);
          },
          errorMessage: 'Invalid address public key',
        },
      },
      email: {
        in: ['body'],
        errorMessage: 'Invalid email',
        isEmail: true,
        normalizeEmail: true,
      },
      message: {
        in: ['body'],
        errorMessage: 'Invalid email',
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
}
