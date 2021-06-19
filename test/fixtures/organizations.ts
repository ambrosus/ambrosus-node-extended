/* tslint:disable */
/* tslint:disable */
export const insertOrganizations = (collections: any) => {
    return new Promise(async (resolve, reject) => {
        await collections.organization.insertMany(
            [
                {
                    organizationId: 1,
                    owner: '0x2C81A356c33D95574a2D502874196d21a2507daD',
                    title: 'Super accounts organization',
                    active: true,
                    createdOn: 1542036855,
                },
                {
                    organizationId: 2,
                    owner: '0xcD156e06318801B441Df42d7064538baEE3747E3',
                    title: 'Admin accounts organization',
                    active: true,
                    createdOn: 1542336855,
                },
                {
                    organizationId: 15,
                    owner: '0xca156e06318801B441Df42d7064538baEE3747E3',
                    title: null,
                    active: true,
                    createdOn: 1542336855,
                }
            ]
        );

        resolve(void(0));
    });
};
