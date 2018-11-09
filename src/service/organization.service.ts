import { inject, injectable } from 'inversify';

import { TYPE, Permission } from '../constant/';
import { OrganizationRepository, OrganizationRequestRepository } from '../database/repository';
import {
  APIQuery,
  ExistsError,
  MongoPagedResult,
  NotFoundError,
  Organization,
  OrganizationRequest,
  UserPrincipal,
  PermissionError,
} from '../model';
import { AccountService } from '../service/account.service';
import { OrganizationInvite } from '../model/organization/organization-invite.model';

@injectable()
export class OrganizationService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.OrganizationRepository)
    private readonly organizationRepository: OrganizationRepository,
    @inject(TYPE.OrganizationRequestRepository)
    private readonly organizationRequestRepository: OrganizationRequestRepository,
    @inject(TYPE.AccountService) private readonly accountService: AccountService
  ) {}

  public getOrganizations(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }
    return this.organizationRepository.find(apiQuery);
  }

  public async getOrganization(organizationId: number): Promise<Organization> {
    if (
      !this.user.hasPermission(Permission.super_account) &&
      organizationId !== this.user.organizationId
    ) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }
    const apiQuery = new APIQuery({ organizationId });
    return this.organizationRepository.findOne(apiQuery);
  }

  public getOrganizationForAuth(organizationId: number): Promise<Organization> {
    const apiQuery = new APIQuery({ organizationId });
    return this.organizationRepository.getOrganizationForAuthorization(apiQuery);
  }

  public getOrganizationAccounts(organizationId: number): Promise<MongoPagedResult> {
    return this.accountService.getAccountsByOrganization(organizationId);
  }

  public getOrganizationRequests(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }
    return this.organizationRequestRepository.find(apiQuery);
  }

  public getOrganizationRequest(address: string): Promise<OrganizationRequest> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }
    const apiQuery = new APIQuery({ address });
    return this.organizationRequestRepository.findOne(apiQuery);
  }

  public async createOrganization(organization: Organization): Promise<any> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }

    if (!(await this.accountService.getAccountExists(organization.owner))) {
      throw new NotFoundError('Organization owner must have an account');
    }

    if (await this.organizationRepository.existsOR(organization, 'title')) {
      throw new ExistsError('An organization already exists with that title');
    }

    if (await this.organizationRepository.existsOR(organization, 'owner')) {
      throw new ExistsError('An organization already exists with that owner');
    }

    organization.setCreationTimestamp(this.user.address);
    organization.organizationId = await this.organizationRepository.getNewOrganizationIdentifier();

    return this.organizationRepository.create(organization);
  }

  public async updateOrganization(
    organizationId: number,
    organization: Organization
  ): Promise<Organization> {
    console.log(this.user.organizationId);
    console.log(organizationId);
    console.log(this.user.isOrganizationOwner());
    if (
      !this.user.hasPermission(Permission.super_account) &&
      !(this.user.organizationId === organizationId && this.user.isOrganizationOwner())
    ) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }
    organization.setMutationTimestamp(this.user.address);
    const apiQuery = new APIQuery({ organizationId });
    return this.organizationRepository.update(apiQuery, organization);
  }

  public async createOrganizationRequest(organizationRequest: OrganizationRequest): Promise<any> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }

    if (
      await this.organizationRequestRepository.existsOR(
        organizationRequest,
        'email',
        'address',
        'title'
      )
    ) {
      throw new ExistsError('An organization request already exists');
    }

    if (await this.accountService.getAccountExists(organizationRequest.address)) {
      throw new ExistsError('An account already exists with this address');
    }

    if (await this.accountService.getAccountExistsForEmail(organizationRequest.email)) {
      throw new ExistsError('An account already exists with this email');
    }

    if (await this.organizationRepository.existsOR(organizationRequest, 'title')) {
      throw new ExistsError('An organization already exists with that title');
    }

    organizationRequest.setCreationTimestamp();

    return this.organizationRequestRepository.create(organizationRequest);
  }

  public async createOrganizationInvite(organizationInvite: OrganizationInvite): Promise<any> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError('You account has insufficient permissions to perform this task');
    }

    console.log(organizationInvite);
    return '';
  }
}
