import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { OrganizationRepository, OrganizationRequestRepository } from '../database/repository';
import {
  APIQuery,
  ExistsError,
  MongoPagedResult,
  NotFoundError,
  Organization,
  OrganizationRequest,
  UserPrincipal,
} from '../model';
import { AccountService } from '../service/account.service';
import { assertWrappingType } from 'graphql';

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
    return this.organizationRepository.find(apiQuery);
  }

  public getOrganization(owner: string): Promise<Organization> {
    const apiQuery = new APIQuery({ owner });
    return this.organizationRepository.findOne(apiQuery);
  }

  public getOrganizationRequests(apiQuery: APIQuery): Promise<MongoPagedResult> {
    return this.organizationRequestRepository.find(apiQuery);
  }

  public getOrganizationRequest(address: string): Promise<OrganizationRequest> {
    const apiQuery = new APIQuery({ address });
    return this.organizationRequestRepository.findOne(apiQuery);
  }

  public async createOrganization(organization: Organization): Promise<any> {
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
    owner: string,
    organization: Organization
  ): Promise<Organization> {
    organization.setMutationTimestamp(this.user.address);
    const apiQuery = new APIQuery({ owner });
    return this.organizationRepository.update(apiQuery, organization);
  }

  public async createOrganizationRequest(organizationRequest: OrganizationRequest): Promise<any> {
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

    if (await this.organizationRepository.existsOR(organizationRequest, 'title')) {
      throw new ExistsError('An organization already exists with that title');
    }

    organizationRequest.setCreationTimestamp();

    return this.organizationRequestRepository.create(organizationRequest);
  }
}
