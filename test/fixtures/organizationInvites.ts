/* tslint:disable */
export const organizationInvites = (collections: any) => {
    return new Promise(async (resolve, reject) => {
        await collections.organizationInvite.insertMany(
            [
                {
                    organizationId: 1,
                    email: 'invite1@test.com',
                    sent: true,
                    validUntil: 1745110902,
                    createdBy: '0x2C81A356c33D95574a2D502874196d21a2507daD',
                    createdOn: 1545110902,
                    inviteId: '13a78393a31d4dc9a42541aec88e7cfc',
                    invitationLink: 'https://asd.com/signup?inviteId=93a78393a31d4dc9a42541aec88e7cfc'
                },
                {
                    organizationId: 2,
                    email: 'invite2@test.com',
                    sent: true,
                    validUntil: 1745110902,
                    createdBy: '0xcD156e06318801B441Df42d7064538baEE3747E3',
                    createdOn: 1543110902,
                    inviteId: '23a78393a31d4dc9a42541aec88e7cfc',
                    invitationLink: 'https://asd.com/signup?inviteId=93a78393a31d4dc9a42541aec88e4cfc'
                },
                {
                    organizationId: 2,
                    email: 'invite3@test.com',
                    sent: true,
                    validUntil: 1745110902,
                    createdBy: '0xcD156e06318801B441Df42d7064538baEE3747E3',
                    createdOn: 1541110902,
                    inviteId: '33a78393a31d4dc9a42541aec88e7cfc',
                    invitationLink: 'https://asd.com/signup?inviteId=93a78393a31d4dc9a42541aec88e3cfc'
                }
            ]
        );
        resolve();
    });
};

