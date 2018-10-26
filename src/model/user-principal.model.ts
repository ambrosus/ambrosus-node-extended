import { interfaces } from 'inversify-express-utils';
import { User } from './user.model';

export class UserPrincipal extends User implements interfaces.Principal {
  public details;

  constructor() {
    super();
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
