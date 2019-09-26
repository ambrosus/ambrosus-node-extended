/* tslint:disable */

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
            organization: 1,
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
            organization: 2,
        });
        await collections.accountDetail.insertOne({
            address: '0xcD156e06318801B441Df42d7064538baEE3747E3',
            fullName: 'John Doe',
            email: 'admin@test.com',
            registeredBy: '0x2C81A356c33D95574a2D502874196d21a2507daD',
            token: 'eyJ2ZXJzaW9uIjozLCJpZCI6IjA1MGU4MmNiLWQwOTctNDMxYS1iZTUzLTk1MGZkNjk0N2Q1YiIsImFkZHJlc3MiOiIyZmRiMjYyZjA3MTY2NjZlYjBjZTMyNTA5ZGIxOWJlMzhlNThjZDI4IiwiY3J5cHRvIjp7ImNpcGhlcnRleHQiOiI0MDVmMzZmYWQ2MjIyNTg1NjgzNzhkZDA4ZDFiNGJmMzhmNjBmMWEyZWZlOTIyN2Q3OTgzMTA4ZmUyYTY2NWRkIiwiY2lwaGVycGFyYW1zIjp7Iml2IjoiOTdlNzcyZmQ2ZjQ2YTc3NGRiNGZmMDFiZjFjNjVjYTAifSwiY2lwaGVyIjoiYWVzLTEyOC1jdHIiLCJrZGYiOiJzY3J5cHQiLCJrZGZwYXJhbXMiOnsiZGtsZW4iOjMyLCJzYWx0IjoiMTg1NGIwZDFkYjE1MzdjYjc1NDQ4MTZiMDY3NjliZTliMTU4M2I3MTU1MmUwOWE5ZjIyY2ZjYTU4MDY1MGJjZCIsIm4iOjgxOTIsInIiOjgsInAiOjF9LCJtYWMiOiI4Zjk5MjU0M2JlYjMxNzJiMDU3OTM0YjAwNDNlNDVhYmUyOGNmNWQ0Y2FmZTQ2NjVmYzRjMzFlNDhkOTE1MDM4In19',
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
            organization: 2,
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
