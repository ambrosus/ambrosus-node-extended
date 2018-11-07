import { Request } from 'express';
import { injectable } from 'inversify';
import { ValidationSchema } from 'express-validator/check';
import web3 = require('web3');
import { getTimestamp } from '../../util/helpers';

export interface IOrganization {
  _id: string;
  organizationId: number;
  owner: string;
  title: string;
  timeZone: string;
  active: boolean;
  legalAddress: string;
  createdBy: string;
  createdOn: number;
  modifiedBy: string;
  modifiedOn: number;
}

@injectable()
export class Organization implements IOrganization {
  public static fromRequest(req: Request) {
    const organization = new Organization();
    organization.owner = req.body.owner;
    organization.title = req.body.title;
    organization.timeZone = req.body.timeZone;
    organization.active = req.body.active;
    organization.legalAddress = req.body.legalAddress;
    return organization;
  }

  public static fromRequestForUpdate(req: Request) {
    const organization = new Organization();
    organization.title = req.body.title;
    organization.timeZone = req.body.timeZone;
    organization.active = req.body.active;
    organization.legalAddress = req.body.legalAddress;
    return organization;
  }

  public static validationSchema(): ValidationSchema {
    return {
      owner: {
        in: ['body'],
        optional: false,
        custom: {
          options: (value, { req, location, path }) => {
            return web3.utils.isAddress(value);
          },
          errorMessage: 'Invalid public key address',
        },
      },
      title: {
        in: ['body'],
        optional: true,
        isLength: {
          errorMessage: 'title may not exceed 200 characters',
          options: { max: 200 },
        },
      },
      timeZone: {
        in: ['body'],
        optional: true,
        isLength: {
          errorMessage: 'Time zone may not exceed 200 characters',
          options: { max: 200 },
        },
      },
      active: {
        in: ['body'],
        optional: false,
        errorMessage: 'Invalid value',
        isBoolean: true,
      },
      legalAddress: {
        in: ['body'],
        optional: true,
        isLength: {
          errorMessage: 'Legal address may not exceed 255 characters',
          options: { max: 255 },
        },
      },
    };
  }

  public _id: string;
  public organizationId: number;
  public owner: string;
  public title: string;
  public timeZone: string;
  public active: boolean;
  public legalAddress: string;
  public createdBy: string;
  public createdOn: number;
  public modifiedBy: string;
  public modifiedOn: number;

  public setCreationTimestamp(address: string) {
    this.createdOn = getTimestamp();
    this.createdBy = address;
  }

  public setMutationTimestamp(address: string) {
    this.modifiedOn = getTimestamp();
    this.modifiedBy = address;
  }
}
