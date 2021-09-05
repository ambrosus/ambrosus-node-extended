/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.io
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

//#region Imports
import { inject, injectable } from 'inversify';
import { DeleteWriteOpResultObject, InsertOneWriteOpResult } from 'mongodb';
import { Request } from 'express';

import { Permission, TYPE } from '../constant/';
import {
  OrganizationInviteRepository,
  OrganizationRepository,
  OrganizationKeysRepository,
  OrganizationRequestRepository,
  AccountRepository,
  AccountDetailRepository,
} from '../database/repository';
import { ILogger } from '../interface/logger.inferface';
import {
  APIQuery,
  MongoPagedResult,
  Organization,
  OrganizationRequest,
  UserPrincipal,
} from '../model';
import { OrganizationInvite } from '../model/organization/organization-invite.model';
import { AccountService } from '../service/account.service';
import { EmailService } from '../service/email.service';

import { ExistsError, ValidationError, NotFoundError, PermissionError, CreateError } from '../errors';
import { config } from '../config';

import { encrypt, decrypt } from '../util/crypto.util';
import { getTimestamp } from '../util';
import { PrivateKeyService } from './privatekey.service';

//#endregion

@injectable()
export class OrganizationService {
  //#region Constructor
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.OrganizationRepository) private readonly organizationRepository: OrganizationRepository,
    @inject(TYPE.OrganizationKeysRepository) private readonly organizationKeysRepository: OrganizationKeysRepository,
    @inject(TYPE.OrganizationRequestRepository) private readonly organizationRequestRepository: OrganizationRequestRepository,
    @inject(TYPE.OrganizationInviteRepository) private readonly organizationInviteRepository: OrganizationInviteRepository,
    @inject(TYPE.AccountRepository) private readonly accountRepository: AccountRepository,
    @inject(TYPE.AccountDetailRepository) private readonly accountDetailRepository: AccountDetailRepository,
    @inject(TYPE.AccountService) private readonly accountService: AccountService,
    @inject(TYPE.EmailService) private readonly emailService: EmailService,
    @inject(TYPE.LoggerService) private readonly logger: ILogger
  ) { }
  //#endregion

  //#region Organization
  public getOrganizations(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    return this.organizationRepository.findWithPagination(apiQuery);
  }

  public async getOrganization(organizationId: number): Promise<Organization> {
    if (
      !this.user.hasPermission(Permission.super_account) &&
      organizationId !== this.user.organizationId
    ) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    const apiQuery = new APIQuery({ organizationId });
    return this.organizationRepository.findOne(apiQuery);
  }

  public async backupOrganization(organizationId: number): Promise<any> {
    this.logger.info(`INFO(backupOrganization) ${organizationId}`);

    if (
      !this.user.hasPermission(Permission.super_account) &&
      organizationId !== this.user.organizationId
    ) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    const apiQuery = new APIQuery({ organizationId });
    const organization = await this.organizationRepository.findOne(apiQuery);
    if (!organization) {
      throw new NotFoundError({ reason: 'Oorganization ID:(${organizationId}) not found' });
    }
    delete organization._id;

    const organizationKey = await this.organizationKeysRepository.findOne(apiQuery);
    if (!organizationKey) {
      throw new NotFoundError({ reason: 'encrypt.ERROR: organization(${organizationId}) key not found' });
    }
    delete organizationKey._id;

    const members = (await this.getOrganizationAccounts(organizationId)).results;
    for (const member of members) {
        delete member._id;
    }

    const data = JSON.stringify({organization, organizationKey, members});

    return { data: encrypt(data, PrivateKeyService.getRetrieved()) };
  }

  public async restoreOrganization(
    req: Request
  ): Promise<Organization> {
    if (
      !this.user.hasPermission(Permission.super_account)
    ) {
      throw new PermissionError({ reason: 'Restore: Unauthorized' });
    }

    if (!req.body.data) {
      throw new ValidationError({ reason: 'Restore: empty data' });
    }

    const data = decrypt(req.body.data, PrivateKeyService.getRetrieved());
    this.logger.info(`INFO(restore data) ${data}`);
    const backup = JSON.parse(data);
    if (
      !backup ||
      !backup.organization ||
      !backup.organizationKey ||
      !backup.members
    ) {
      throw new ValidationError({ reason: 'Restore: wrong data' });
    }

    const organizationId: number = backup.organization.organizationId;

    const apiQuery = new APIQuery({ organizationId });

    if ((await this.organizationKeysRepository.count(apiQuery)) > 0) {
      throw new ExistsError({ reason: 'An organization already exists with that ID.' });
    }

    const organizationKey = await this.organizationKeysRepository.update(apiQuery, backup.organizationKey, true);

    const organization = await this.organizationRepository.update(apiQuery, backup.organization, true);

    for (const member of backup.members) {
      try {
        await this.accountService.createAccount(
          member.address,
          member.accessLevel,
          member.organizationId,
          member.permissions,
          member.email,
          member.fullName,
          member.createdBy
        );
      } catch (e) {
        this.logger.warn(`WARNING(Restore) ${e}`);
      }
    }

    organization.modifiedOn = getTimestamp();
    organization.modifiedBy = this.user.address;

    return this.organizationRepository.update(apiQuery, organization);
  }

  public getOrganizationForAuth(organizationId: number): Promise<Organization> {
    const apiQuery = new APIQuery({ organizationId });
    return this.organizationRepository.getOrganizationForAuthorization(apiQuery);
  }

  public getOrganizationAccounts(organizationId: number): Promise<MongoPagedResult> {
    return this.accountService.getAccountsByOrganization(organizationId);
  }

  public async createOrganization(organization: Organization): Promise<any> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    if (await this.accountService.getAccountExists(organization.owner)) {
      throw new NotFoundError({ reason: 'Organization owner already has an account' });
    }

    if (await this.organizationRepository.existsOR(organization, 'title')) {
      throw new ExistsError({ reason: 'An organization already exists with that title.' });
    }

    if (await this.organizationRepository.existsOR(organization, 'owner')) {
      throw new ExistsError({ reason: 'An organization already exists with that owner.' });
    }

    organization.setCreationTimestamp(this.user.address);
    organization.organizationId = await this.organizationRepository.getNewOrganizationIdentifier();

    return this.organizationRepository.createOrganization(organization);
  }

  public async updateOrganization(
    organizationId: number,
    organization: Organization
  ): Promise<Organization> {
    if (
      !this.user.hasPermission(Permission.super_account) &&
      !(Number(this.user.organizationId) === Number(organizationId) && this.user.isOrganizationOwner())
    ) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    if (await this.organizationRepository.existsOR(organization, 'title')) {
      throw new ExistsError({ reason: 'An organization already exists with that title.' });
    }

    organization.setMutationTimestamp(this.user.address);
    const apiQuery = new APIQuery({ organizationId });
    return this.organizationRepository.update(apiQuery, organization);
  }
  //#endregion

  //#region Organization Request
  public getOrganizationRequests(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    apiQuery.addToQuery({ refused: { $ne: true } });
    return this.organizationRequestRepository.findWithPagination(apiQuery);
  }

  public getOrganizationRequestsRefused(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    apiQuery.addToQuery({ refused: true });
    return this.organizationRequestRepository.findWithPagination(apiQuery);
  }

  public getOrganizationRequest(address: string): Promise<OrganizationRequest> {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    const apiQuery = new APIQuery({ address });
    return this.organizationRequestRepository.findOne(apiQuery);
  }

  public async createOrganizationRequest(organizationRequest: OrganizationRequest): Promise<any> {
    const errors = {
      organizationRequest: [],
      account: [],
      organization: [],
    };

    // Check organization request

    if (await this.organizationRequestRepository.existsOR(organizationRequest, 'email')) {
      errors.organizationRequest.push('email');
    }
    if (await this.organizationRequestRepository.existsOR(organizationRequest, 'address')) {
      errors.organizationRequest.push('address');
    }
    if (await this.organizationRequestRepository.existsOR(organizationRequest, 'title')) {
      errors.organizationRequest.push('title');
    }

    if (errors.organizationRequest.length) {
      throw new ExistsError({ reason: `An organization request already exists with this ${errors.organizationRequest.join(', ')}.` });
    }

    // Check account

    if (await this.accountRepository.existsOR(organizationRequest, 'address')) {
      errors.account.push('address');
    }
    if (await this.accountDetailRepository.existsOR(organizationRequest, 'email')) {
      errors.account.push('email');
    }

    if (errors.account.length) {
      throw new ExistsError({ reason: `An account already exists with this ${errors.account.join(', ')}.` });
    }

    // Check organization

    if (await this.organizationRepository.existsOR(organizationRequest, 'title')) {
      errors.organization.push('title');
    }

    if (errors.organization.length) {
      throw new ExistsError({ reason: `An organization already exists with this ${errors.organization.join(', ')}.` });
    }

    // Send email
    await this.emailService.sendOrganizationRequest(organizationRequest);

    organizationRequest.setCreationTimestamp();

    return this.organizationRequestRepository.create(organizationRequest);
  }

  public async deleteOrganizationRequest(address: string): Promise<DeleteWriteOpResultObject> {
    const apiQuery = new APIQuery({ address });
    return this.organizationRequestRepository.deleteOne(apiQuery);
  }

  public async organizationRequestApprove(address: string) {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    let newOrganizationId;
    const organizationRequest = await this.getOrganizationRequest(address);
    if (!organizationRequest) {
      throw new NotFoundError({ reason: 'Organization request not found.' });
    }

    // Create organization
    const newOrganization = new Organization();
    newOrganization.owner = organizationRequest.address;
    newOrganization.title = organizationRequest.title || `${organizationRequest.email}'s organization`;

    const result: InsertOneWriteOpResult<any> = await this.createOrganization(newOrganization);
    if (!result.ops[0]) {
      throw new CreateError({ reason: 'Organization' });
    }
    newOrganizationId = result.ops[0].organizationId;

    // Create account with new organizationId
    await this.accountService.createAccount(
      address,
      900,
      newOrganizationId,
      [Permission.create_asset, Permission.create_event, Permission.register_accounts, Permission.manage_accounts],
      organizationRequest.email,
      undefined,
      this.user.address
    );

    // Send email
    await this.emailService.sendOrganizationRequestApproval(organizationRequest);

    // Remove organization request
    await this.deleteOrganizationRequest(address);
  }

  public async organizationRequestRefuse(address: string) {
    if (!this.user.hasPermission(Permission.super_account)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }

    const organizationRequest = await this.getOrganizationRequest(address);
    if (!organizationRequest) {
      throw new NotFoundError({ reason: 'Organization request not found.' });
    }

    // Send email
    await this.emailService.sendOrganizationRequestRefuse(organizationRequest);

    // Mark organization request refused
    organizationRequest.refused = true;
    const apiQuery = new APIQuery({ address });
    await this.organizationRequestRepository.update(apiQuery, organizationRequest);
  }
  //#endregion

  //#region Organization Invite
  public async getOrganizationInvites(apiQuery: APIQuery): Promise<MongoPagedResult> {
    if (!(this.user.organization && this.user.organization.organizationId)) {
      throw new PermissionError({ reason: 'Unauthorized' });
    }
    if (!apiQuery.query) {
      apiQuery.query = {};
    }
    apiQuery.query.organizationId = this.user.organization.organizationId;

    await this.organizationInviteRepository.deleteExpired();

    return this.organizationInviteRepository.findWithPagination(apiQuery);
  }

  public getInviteEmail(organization: Organization) {
    if (!organization.inviteEmail) {
      return config.email.defaultFrom;
    }

    return organization.inviteEmail;
  }

  public getInviteTemplateId(organization: Organization) {

    if (!organization.inviteTemplateId) {
      return config.email.templateIdInvite;
    }

    return organization.inviteTemplateId;
  }

  public async createOrganizationInvites(emails: string[]): Promise<any> {
    await this.organizationInviteRepository.deleteExpired();

    const inviteEmail = this.getInviteEmail(this.user.organization);
    const inviteTemplateId = this.getInviteTemplateId(this.user.organization);

    const failed = [];
    const success = [];
    for (const email of emails) {
      const organizationInvite = OrganizationInvite.forEmail(email, this.user);
      if (await this.accountService.getAccountExistsForEmail(email)) {
        failed.push({ email, reason: 'Email used by an existing account.' });
        this.logger.debug(`${email} is being used by another account`);
        continue;
      }
      if (await this.organizationInviteRepository.existsOR(organizationInvite, 'email')) {
        failed.push({ email, reason: 'An invite already exists with this email.' });
        this.logger.debug(`An invite for ${email} already exists.`);
        continue;
      }
      try {
        await this.organizationInviteRepository.create(organizationInvite);
        await this.emailService.sendInvitation(organizationInvite, inviteEmail, inviteTemplateId);
        success.push(organizationInvite.email);
      } catch (error) {
        failed.push({ email, reason: error.message });
        this.logger.debug(`An invite for ${email} already exists.`);
      }
    }

    return { sent: success, errors: failed };
  }

  public async resendOrganizationInvites(emails: string[]): Promise<any> {
    const failed = [];
    const success = [];

    const inviteEmail = this.getInviteEmail(this.user.organization);
    const inviteTemplateId = this.getInviteTemplateId(this.user.organization);

    for (const email of emails) {
      try {
        const apiQuery = new APIQuery({ email });
        const organizationInvite = await this.organizationInviteRepository.findOne(apiQuery);
        if (!organizationInvite) {
          throw new NotFoundError({ reason: 'No invite found for email.' });
        }
        await this.emailService.sendInvitation(organizationInvite, inviteEmail, inviteTemplateId);
        await this.organizationInviteRepository.update(apiQuery, organizationInvite);
        success.push(email);
      } catch (error) {
        failed.push({ email, reason: error.message });
        this.logger.debug(error);
      }
    }
    return { sent: success, errors: failed };
  }

  public async organizationInviteExists(inviteId: string): Promise<boolean> {
    await this.organizationInviteRepository.deleteExpired();

    const apiQuery = new APIQuery({ inviteId });
    const invite = await this.organizationInviteRepository.findOne(apiQuery);
    if (!invite) {
      throw new NotFoundError({ reason: 'Invite not found.' });
    }
    return true;
  }

  public async deleteOrganizationInvite(inviteId: string): Promise<DeleteWriteOpResultObject> {
    const apiQuery = new APIQuery({ inviteId });
    return this.organizationInviteRepository.deleteOne(apiQuery);
  }

  public async acceptOrganizationInvite(inviteId: string, address: string) {
    await this.organizationInviteRepository.deleteExpired();
    const apiQuery = new APIQuery({ inviteId });
    const invite = await this.organizationInviteRepository.findOne(apiQuery);
    if (!invite) {
      throw new ValidationError({ reason: 'Invite not found.' });
    }
    await this.accountService.createAccount(
      address,
      1,
      invite.organizationId,
      [Permission.create_asset, Permission.create_event],
      invite.email,
      undefined,
      invite.createdBy
    );

    await this.organizationInviteRepository.deleteOne(apiQuery);

    return address;
  }
  //#endregion

  public hexdec(hexString) {
    const hexFormatted = (hexString).replace(/[^a-f0-9]/gi, '');
    return parseInt(hexFormatted, 16);
  }

  public hex2bin(hexSource: string) {
    let hexNormalized: string;

    if (hexSource.indexOf('0x') === 0) {
      hexNormalized = hexSource.substring(2);
    } else {
      hexNormalized = hexSource;
    }

    let bin = '';
    for (let i = 0; i < hexNormalized.length; i = i + 2) {
        bin += String.fromCharCode(this.hexdec(hexNormalized.substr(i, 2)));
    }
    return bin;
  }

  public async encrypt(data: string, organizationId: number): Promise<string> {
    const organizationKey = await this.organizationKeysRepository.findOne(new APIQuery({organizationId}));

    if (organizationKey !== undefined) {
      return encrypt(data, organizationKey.Key);
    }

    return `encrypt.ERROR: organization(${organizationId}) key not found`;
  }

  public async decrypt(data: string, organizationId: number): Promise<string> {
    const organizationKey = await this.organizationKeysRepository.findOne(new APIQuery({organizationId}));

    if (organizationKey !== undefined) {
      return decrypt(data, organizationKey.Key);
    }

    return `decrypt.ERROR: organization(${organizationId}) key not found`;
  }
}
