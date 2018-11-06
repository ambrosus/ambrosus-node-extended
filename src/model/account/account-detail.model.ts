import { Request } from 'express';
import { ValidationSchema } from 'express-validator/check';
import { injectable } from 'inversify';

import { getTimestamp } from '../../util/helpers';
import { Account } from './account.model';

export interface IAccountDetail {
  _id: string;
  address: string;
  fullName: string;
  email: string;
  password: string;
  token: number;
  extendedPermissions: string[];
  timeZone: string;
  lastSeen: number;
  createdBy: string;
  createdOn: number;
  modifiedBy: string;
  modifiedOn: number;
}

@injectable()
export class AccountDetail extends Account implements IAccountDetail {
  public static fromRequestForUpdate(req: Request) {
    const accountDetail = new AccountDetail();
    accountDetail.fullName = req.body.fullName;
    accountDetail.email = req.body.email;
    accountDetail.token = req.body.token;
    accountDetail.timeZone = req.body.timeZone;
    return accountDetail;
  }

  public static validationSchema(): ValidationSchema {
    return {
      fullName: {
        in: ['body'],
        optional: true,
        isLength: {
          errorMessage: 'Full name may not exceed 200 characters',
          options: { max: 200 },
        },
      },
      email: {
        in: ['body'],
        optional: false,
        errorMessage: 'Invalid email format',
        isEmail: true,
        normalizeEmail: true,
      },
      token: {
        in: ['body'],
        optional: true,
        isBase64: true,
      },
      timeZone: {
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
  public fullName: string;
  public email: string;
  public password: string;
  public token: number;
  public extendedPermissions: string[];
  public timeZone: string;
  public lastSeen: number;
  public createdBy: string;
  public createdOn: number;
  public modifiedBy: string;
  public modifiedOn: number;

  public setMutationTimestamp(address: string) {
    this.modifiedOn = getTimestamp();
    this.modifiedBy = address;
  }
}
