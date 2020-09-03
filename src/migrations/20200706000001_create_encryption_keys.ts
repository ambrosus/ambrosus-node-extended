/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

// tslint:disable-next-line:no-var-requires
const web3 = require('web3');

// eslint-disable-next-line import/prefer-default-export
export const up = async (db, config, logger) => {
  const organizations = await db.collection('organization').find();

  let createCount = 0;

  const createOrganizationKey = async (organization) => {
      const currentItem = await db.collection('organizationKeys').findOne({ organizationId: organization.organizationId });

      const Web3 = new web3();

      if (!currentItem) {
        const keyItem = {
          organizationId: organization.organizationId,
          Key: Web3.eth.accounts.create(Web3.utils.randomHex(32)).privateKey,
        };

        db.collection('organizationKeys').insertOne(keyItem);

        createCount = createCount + 1;
      }
  };

  while (await organizations.hasNext()) {
    await createOrganizationKey(await organizations.next());
  }

  logger.info(`Created keys for ${createCount} organizations`);
};
