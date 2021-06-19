/* tslint:disable */
export const organizationRequests = (collections: any) => {
  return new Promise(async (resolve, reject) => {
    await collections.organizationRequest.insertMany(
      [
        {
          address: '0x475fd3FAA4C28de5aA4E6Ab168BFC5e732a1FAAE',
          email: 'request1@test.com',
          message: 'Some message 1',
          createdOn: 1545046935
        },
        {
          title: 'Organization name 2',
          address: '0xED3F43988aD00A74a5E3ed592cC94cB919D9306F',
          email: 'request2@test.com',
          message: 'Some message 2',
          createdOn: 1545034242
        },
        {
          title: 'Organization name 3',
          address: '0x9c746031ae6152C3a651cB64A4929E4c19C6083c',
          email: 'request3@test.com',
          message: 'Some message 3',
          createdOn: 1544950885,
          refused: true,
        }
      ]
    );
    resolve(void(0));
  });
};

