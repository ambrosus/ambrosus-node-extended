
// privateKey: 0xce75741e246852f1bf8e4f86ccf7d56f77942c37ea7b683d3a3735f1635de7c9
export const super_account = (collections: any) => {
    return new Promise(async (resolve, reject) => {
        await collections.accounts.insertOne({
            address: '0x2C81A356c33D95574a2D502874196d21a2507daD',
            accessLevel: 5,
            permissions: [
                'super_account',
                'manage_accounts',
                'register_accounts',
                'create_event',
                'create_asset',
            ],
        });
        await collections.accountDetail.insertOne({
            address: '0x2C81A356c33D95574a2D502874196d21a2507daD',
            email: 'super@test.com',
        });
        resolve();
    });
};

// privateKey: 0xa06c37def3a202c94508d3cb45c0009b91b85861f90284f4ce98f1ec6ce9913a
export const admin_account = (collections: any) => {
    return new Promise(async (resolve, reject) => {
        await collections.accounts.insertOne({
            address: '0xcD156e06318801B441Df42d7064538baEE3747E3',
            accessLevel: 3,
            permissions: [
                'manage_accounts',
                'register_accounts',
                'create_event',
                'create_asset',
            ],
        });
        await collections.accountDetail.insertOne({
            address: '0xcD156e06318801B441Df42d7064538baEE3747E3',
            email: 'admin@test.com',
        });
        resolve();
    });
};

// privateKey: 0x0926f9a238aae2cdee9a687615f52052630b23f5511638204cd7d3fe4e0f53de
export const regular_account = (collections: any) => {
    return new Promise(async (resolve, reject) => {
        await collections.accounts.insertOne({
            address: '0x1403F4C7059206291E101F2932d73Ed013B2FF71',
            accessLevel: 3,
            permissions: [
                'create_event',
                'create_asset',
            ],
        });
        await collections.accountDetail.insertOne({
            address: '0x1403F4C7059206291E101F2932d73Ed013B2FF71',
            email: 'regular@test.com',
        });
        resolve();
    });
};

export const all_accounts = (collections: any) => {
    return new Promise(async (resolve, reject) => {
        await super_account(collections);
        await admin_account(collections);
        await regular_account(collections);
        resolve();
    });
};
