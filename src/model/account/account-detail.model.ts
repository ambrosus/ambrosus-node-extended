import { Request } from 'express';
import { ValidationSchema } from 'express-validator/check';
import { injectable } from 'inversify';

import { getTimestamp } from '../../util';
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
    if (req.body.fullName) {
      accountDetail.fullName = req.body.fullName;
    }
    if (req.body.email) {
      accountDetail.email = req.body.email;
    }
    if (req.body.token) {
      accountDetail.token = req.body.token;
    }
    if (req.body.timeZone) {
      accountDetail.timeZone = req.body.timeZone;
    }
    return accountDetail;
  }

  public static validationSchema(): ValidationSchema {
    return {
      fullName: {
        in: ['body'],
        optional: true,
        isLength: {
          errorMessage: 'Full name may not exceed 100 characters',
          options: { max: 100 },
        },
      },
      email: {
        in: ['body'],
        optional: true,
        errorMessage: 'Invalid email format',
        isEmail: true,
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
          errorMessage: 'Timezone may not exceed 50 characters',
          options: { max: 50 },
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
