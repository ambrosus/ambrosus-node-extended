/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.io

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

// eslint-disable-next-line import/prefer-default-export
export const up = async (db, config, logger) => {
  const assets = await db.collection('assets').find({organizationId: {$exists: false}});

  let fillCount = 0;

  const fillOrganizationId = async (asset) => {
    console.log(`updatingAsset(organizationId): ${asset.assetId}`);

    const account = await db.collection('accounts').findOne({ address: asset.content.idData.createdBy });

    if (account !== null) {
     await db.collection('assets').updateOne(
      {assetId: asset.assetId},
      {$set : {organizationId: account.organization}}
     );

     fillCount = fillCount + 1;
    }
  };

  while (await assets.hasNext()) {
    await fillOrganizationId(await assets.next());
  }

  logger.info(`Filled organizationIds for ${fillCount} assets`);
};
