import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { OrganizationRepository, OrganizationRequestRepository } from '../database/repository';
import {
  APIQuery,
  ExistsError,
  MongoPagedResult,
  OrganizationRequest,
  UserPrincipal,
} from '../model';
import { AccountService } from '../service/account.service';

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

  public getOrganization(organizationId: string): Promise<MongoPagedResult> {
    const apiQuery = new APIQuery({ organizationId });
    return this.organizationRepository.find(apiQuery);
  }

  public getOrganizationRequests(apiQuery: APIQuery): Promise<MongoPagedResult> {
    return this.organizationRequestRepository.find(apiQuery);
  }

  public getOrganizationRequest(address: string): Promise<OrganizationRequest> {
    const apiQuery = new APIQuery({ address });
    return this.organizationRequestRepository.findOne(apiQuery);
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

    return this.organizationRequestRepository.create(organizationRequest);
  }
}
