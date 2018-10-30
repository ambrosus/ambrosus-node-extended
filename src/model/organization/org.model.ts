import { injectable } from 'inversify';

export interface IOrganization {
  _id: string;
  organizationId: number;
  owner: string;
  title: string;
  legalAddress: string;
  active: boolean;
  createdBy: string;
  createdOn: number;
  modifiedBy: string;
  modifiedOn: number;
}

@injectable()
export class Organization implements IOrganization {
    public _id: string;
    public organizationId: number;
    public owner: string;
    public title: string;
    public legalAddress: string;
    public active: boolean;
    public createdBy: string;
    public createdOn: number;
    public modifiedBy: string;
    public modifiedOn: number;
}
