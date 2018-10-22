import { interfaces } from 'inversify-express-utils';
import { Request, Response, NextFunction } from 'express';
import { Account, User } from './';
import { AuthToken } from './auth-token.model';

export interface IPrincipal extends interfaces.Principal {
  account?: Account;
  authToken?: AuthToken;

  isAuthorized(): boolean;
  hasRole(role: string): boolean;
  hasPermission(permission: string): boolean;
}

export class Principal implements IPrincipal {
  public details;

  public constructor(public account?: Account, public authToken?: AuthToken) {}

  public isAuthorized(): boolean {
    return this.account && this.authToken && this.authToken.isValid();
  }

  public hasRole(role: string): boolean {
    return true;
  }

  public hasPermission(permission: string): boolean {
    return true;
  }

  public isAuthenticated(): Promise<boolean> {
    return Promise.reject(new Error('Method not implemented'));
  }

  public isResourceOwner(resourceId: any): Promise<boolean> {
    return Promise.reject(new Error('Method not implemented'));
  }

  public isInRole(role: string): Promise<boolean> {
    return Promise.reject(new Error('Method not implemented'));
  }
}
