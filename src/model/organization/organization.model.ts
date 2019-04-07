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

  public setCreationTimestamp(address: string) {
    this.createdOn = getTimestamp();
    this.createdBy = address;
  }

  public setMutationTimestamp(address: string) {
    this.modifiedOn = getTimestamp();
    this.modifiedBy = address;
  }
}
