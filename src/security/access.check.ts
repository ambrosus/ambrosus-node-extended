/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
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

/* tslint:disable */

import { 
  Account, 
  APIQuery
} from '../model';

import { OrganizationRepository } from '../database/repository';
import { Permission } from '../constant/';
import { 
  PermissionError,
  ValidationError
 } from '../errors';

function hasPermission(account :Account, permission: string): boolean {
  return account ? account.permissions.indexOf(permission) > -1 : false;
}

function ensureAccountIsActive(account :Account) {
  if (!account.active) {
    throw new PermissionError({ reason: 'creator account must be active' });
  }
}

function ensureAccessLevel(creator: Account, newAccount: Account) {
  if (newAccount.accessLevel > creator.accessLevel) {
    throw new PermissionError({ reason: 'newAccount acessLevel must less or equal' });
  }
}

function ensureNoSuperPermission(newAccount: Account) {
  if (hasPermission(newAccount, Permission.super_account)) {
    throw new PermissionError({ reason: 'creator must have super_account permission to create another super_account' });
  }
}

function validateCorrectPermission(permissionName) {  
  if (!Object.values(Permission).includes(permissionName)) {    
    throw new ValidationError({reason: `${permissionName} is not a valid permission.`});
  }
}

function ensureCorrectPermissions(account :Account) {  
  account.permissions.forEach(validateCorrectPermission);
}

async function ensureOrganizationIsActive(organizationRepository: OrganizationRepository, creator: Account) {
  const organization = await organizationRepository.findOne(new APIQuery({ organizationId: creator.organization }));

  if (!organization.active) {
    throw new PermissionError({ reason: 'creators organization must be active' });
  }
}

export const ensureCanCreateAccount = async (organizationRepository: OrganizationRepository, creator: Account, newAccount: Account) => {  
  ensureAccountIsActive(creator);
  ensureAccessLevel(creator, newAccount);
  
  ensureCorrectPermissions(newAccount);
  
  if (hasPermission(creator, Permission.super_account)) {
    return
  }

  ensureNoSuperPermission(newAccount);

  await ensureOrganizationIsActive(organizationRepository, creator);
};

