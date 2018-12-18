/* tslint:disable */
export const events = (collections: any) => {
  return new Promise(async (resolve, reject) => {
    await collections.events.insertMany(
      [
        {
          content: {
            idData: {
              assetId: '0x6904151c80b33a26925bf940b061c7d365dee013f468adc555d6c699dc0e3b79',
              createdBy: '0x2C81A356c33D95574a2D502874196d21a2507daD',
              accessLevel: 0,
              timestamp: 1527787027,
              dataHash: '0xa91ecbbef2dee6f85f78e0e32e6fa44fbe06b591d1a41416bbd89361a9e70913'
            },
            data: [
              {
                type: 'ambrosus.asset.arival',
                location: 'Harbor, Basel, Switzerland'
              }
            ],
            signature: '0xfc09992deb180cc7816d91cf53a6a82d80677d927ccffb6cb6c00201ed5f19da6c47aaef1dbd617b8cc9e9f597c184b0f146cde0bd4aa28b54fbaa09d1a3d62f1b'
          },
          eventId: '0x8663d7863dc5131d5ad6050d44ed625cd299b78d2ce289ffc95e63b1559c3f63',
          metadata: {
            bundleTransactionHash: '0x3a7e7c0aa8de329255d0d527faaf2de54c549e4431ec6fcc42762297201e4a9e',
            bundleUploadTimestamp: 1539355085
          }
        },
        {
          content: {
            idData: {
              assetId: '0x6904151c80b33a26925bf940b061c7d365dee013f468adc555d6c699dc0e3b79',
              createdBy: '0x2C81A356c33D95574a2D502874196d21a2507daD',
              accessLevel: 0,
              timestamp: 1527849836798,
              dataHash: '0x0770a9556900be7b0f52a07ade435753c242f73bc268421a5011d908d6f3b77e'
            },
            data: [
              {
                type: 'ambrosus.asset.displayed',
                name: 'Displayed'
              }
            ],
            signature: '0x9a11d006ed815c74b5e66d844521f520b688643b41968f6e171b7781acfad1c20f84d49b4539ae9573491a6596ec5171b95ca28590794d9310c8a7cba5be606c1c'
          },
          eventId: '0x6e293595d74023b390913bb2eec58dde0896d4c37b6cb9b222377adbaa5c2f7d',
          metadata: {
            bundleTransactionHash: '0x0285ed8ee9ffd3aafe2c6e02b9f43c11bdc56de5a9890a0fa65ab6b51b986f9b',
            bundleUploadTimestamp: 1542279996
          }
        },
        {
          content: {
            idData: {
              assetId: '0x2e66b0ecbf9e7ada44b423ab8183a5adcf4a571e4020572e7a528c6629f77fde',
              createdBy: '0xcD156e06318801B441Df42d7064538baEE3747E3',
              accessLevel: 0,
              timestamp: 1527849836529,
              dataHash: '0x0770a9556900be7b0f52a07ade435753c242f73bc268421a5011d908d6f3b77e'
            },
            data: [
              {
                type: 'ambrosus.asset.sold',
                name: 'Sold'
              }
            ],
            signature: '0xfdaae3aa2489b14d3b1bb880410f640a3062d8567f914562eea3f002b8f487124def36160563ef4a8a03ac0ed1575023af547af5477cc0b615d323d8ddb553541c'
          },
          eventId: '0x8c8aefde7f37d9fbbe14ee32489386495440c7a5ff275a2b611396ae9ed83baa',
          metadata: {
            bundleTransactionHash: '0x0285ed8ee9ffd3aafe2c6e02b9f43c11bdc56de5a9890a0fa65ab6b51b986f9b',
            bundleUploadTimestamp: 1542279996
          }
        },
        {
          content: {
            idData: {
              assetId: '0x0307681fb53229a18384324aae7e3e639e8550edfa897ead2dd2647eeca0fbff',
              createdBy: '0xcD156e06318801B441Df42d7064538baEE3747E3',
              accessLevel: 0,
              timestamp: 1527066741753,
              dataHash: '0x073a6a4d4622ac335b1db5dd8f5bf1e49caabe13a21fc27c66f88a405c114c0a'
            },
            data: [
              {
                type: 'ambrosus.asset.recalled',
                name: 'Recalled',
                someInfo: 'Some content'
              }
            ],
            signature: '0x26d63adc63ca265c427820fb8bd4651eb3d33a9546e9f0f4c9bbcdf96bfde626385d139ca65b5159076219283a7aa4572b06a6fda12e6d82dfb2fb0cc00c22051b'
          },
          eventId: '0x01579a779f129277457185682daab7dc56d18a22a4abdac95831c338984ce310',
          metadata: {
            bundleTransactionHash: '0x0285ed8ee9ffd3aafe2c6e02b9f43c11bdc56de5a9890a0fa65ab6b51b986f9b',
            bundleUploadTimestamp: 1542279996
          }
        }
      ]
    );
    resolve();
  });
};

