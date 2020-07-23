/*
Copyright: Ambrosus Inc.
Email: tech@ambrosus.com

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

// eslint-disable-next-line import/prefer-default-export
const up = async (db, config, logger) => {
  const events = await db.collection('events').find({organizationId: {$exists: false}});

  let fillCount = 0;

  const fillOrganizationId = async (event) => {
    console.log(`updatingEvent(organizationId): ${event.eventId}`);

    const account = await db.collection('accounts').findOne({ address: event.content.idData.createdBy });

    if (account !== null) {
     await db.collection('events').updateOne(
      {eventId: event.eventId},
      {$set : {organizationId: account.organization}},
     );

     fillCount = fillCount + 1;
    }    
  };

  while (await events.hasNext()) {
    await fillOrganizationId(await events.next());
  }

  logger.info(`Filled organizationIds for ${fillCount} events`);
};

module.exports = { up };
