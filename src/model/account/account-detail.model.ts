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
    if (undefined !== req.body['fullName']) {
      accountDetail.fullName = req.body.fullName;
    }
    if (undefined !== req.body['email']) {
      accountDetail.email = req.body.email;
    }
    if (undefined !== req.body['token']) {
      accountDetail.token = req.body.token;
    }
    if (undefined !== req.body['timeZone']) {
      accountDetail.timeZone = req.body.timeZone;
    }
    return accountDetail;
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
