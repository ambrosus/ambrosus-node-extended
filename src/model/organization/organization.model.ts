/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Request } from 'express';
import { injectable } from 'inversify';
import { getTimestamp } from '../../util';

export interface IOrganization {
  _id?: string;
  organizationId: number;
  owner: string;
  title?: string;
  timeZone?: string;
  active: boolean;
  legalAddress?: string;
  logo?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  createdBy?: string;
  createdOn?: number;
  modifiedBy?: string;
  modifiedOn?: number;
  inviteEmail?: string;
  inviteTemplateId?: string;
  encryptionKey?: string;
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
    if (undefined !== req.body['title']) {
      organization.title = req.body.title;
    }
    if (undefined !== req.body['timeZone']) {
      organization.timeZone = req.body.timeZone;
    }
    if (undefined !== req.body['active']) {
      organization.active = req.body.active;
    }
    if (undefined !== req.body['legalAddress']) {
      organization.legalAddress = req.body.legalAddress;
    }
    if (undefined !== req.body['logo']) {
      organization.logo = req.body.logo;
    }
    if (undefined !== req.body['colorPrimary']) {
      organization.colorPrimary = req.body.colorPrimary;
    }
    if (undefined !== req.body['colorSecondary']) {
      organization.colorSecondary = req.body.colorSecondary;
    }
    if (undefined !== req.body['inviteEmail']) {
      organization.inviteEmail = req.body.inviteEmail;
    }
    if (undefined !== req.body['inviteTemplateId']) {
      organization.inviteTemplateId = req.body.inviteTemplateId;
    }
    return organization;
  }

  public _id?: string;
  public organizationId: number;
  public owner: string;
  public title?: string;
  public timeZone?: string;
  public active: boolean;
  public legalAddress?: string;
  public logo?: string;
  public colorPrimary?: string;
  public colorSecondary?: string;
  public createdBy?: string;
  public createdOn?: number;
  public modifiedBy?: string;
  public modifiedOn?: number;
  public inviteEmail?: string;
  public inviteTemplateId?: string;
  public encryptionKey?: string;

  public setCreationTimestamp(address: string) {
    this.createdOn = getTimestamp();
    this.createdBy = address;
  }

  public setMutationTimestamp(address: string) {
    this.modifiedOn = getTimestamp();
    this.modifiedBy = address;
  }
}
