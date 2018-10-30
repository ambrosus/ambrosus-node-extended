import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { OrganizationRepository, OrganizationRequestRepository } from '../database/repository';
import {
  OrganizationRequest,
  UserPrincipal,
  ExistsError,
  APIResult,
  APIQuery,
} from '../model';
import { AccountService } from '../service/account.service';

@injectable()
export class OrganizationService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.OrganizationRepository) private readonly orgRepository: OrganizationRepository,
    @inject(TYPE.OrganizationRequestRepository)
    private readonly orgRequestRepository: OrganizationRequestRepository,
    @inject(TYPE.AccountService) private readonly accountService: AccountService
  ) {}

  public getOrgRequests(apiQuery: APIQuery): Promise<APIResult> {
    return this.orgRequestRepository.getOrganizationRequests(apiQuery);
  }

  public getOrgRequest(address: string): Promise<OrganizationRequest> {
    const apiQuery = new APIQuery();
    apiQuery.query = { address };
    return this.orgRequestRepository.getOrganizationRequest(apiQuery);
  }

  public async createOrgRequest(orgRequest: OrganizationRequest): Promise<any> {
    if (await this.orgRequestRepository.existsOR(orgRequest, 'email', 'address', 'title')) {
      throw new ExistsError('An organization request already exists');
    }

    if (await this.accountService.getAccountExists(orgRequest.address)) {
      throw new ExistsError('An account already exists with this address');
    }

    if (await this.orgRepository.existsOR(orgRequest, 'title')) {
      throw new ExistsError('An organization already exists with that title');
    }

    return this.orgRequestRepository.create(orgRequest);
  }
}
