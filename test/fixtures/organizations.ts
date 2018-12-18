/* tslint:disable */

export const super_account_organization = (collections: any) => {
    return new Promise(async (resolve, reject) => {
        await collections.organization.insertOne({
            organizationId: 1,
            owner: '0x2C81A356c33D95574a2D502874196d21a2507daD',
            title: 'Super accounts organization',
            active: true,
            createdOn: 1542036855,
        });
        resolve();
    });
};

export const admin_account_organzation = (collections: any) => {
    return new Promise(async (resolve, reject) => {
        await collections.organization.insertOne({
            organizationId: 2,
            owner: '0xcD156e06318801B441Df42d7064538baEE3747E3',
            title: 'Admin accounts organization',
            active: true,
            createdOn: 1542336855,
        });
        resolve();
    });
};

export const all_organizations = (collections: any) => {
    return new Promise(async (resolve, reject) => {
        await super_account_organization(collections);
        await admin_account_organzation(collections);
        resolve();
    });
};
