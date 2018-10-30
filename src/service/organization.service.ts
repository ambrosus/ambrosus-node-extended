import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { OrganizationRepository, OrganizationRequestRepository } from '../database/repository';
import {
  OrganizationRequest,
  UserPrincipal,
  ValidationError,
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

  public async createOrgRequest(orgRequest: OrganizationRequest): Promise<any> {
    if (await this.orgRequestRepository.existsOr(orgRequest, 'email', 'address', 'title')) {
      throw new ValidationError('An organization request already exists');
    }

    if (this.accountService.getAccountExists(orgRequest.address)) {
      throw new ValidationError('An account already exists with this address');
    }

    if (await this.orgRepository.existsOr(orgRequest, 'title')) {
      throw new ValidationError('An organization already exists with that title');
    }

    return this.orgRequestRepository.create(orgRequest);
  }
}
