/* tslint:disable */
export const bundles = (collections: any) => {
    return new Promise(async (resolve, reject) => {
        await collections.bundle_metadata.insertMany(
            [
                {
                    bundleId: '0x0419a305e34825a2c4ba91f4a7202e9aa6ba698761e3f3484402d221acf4cf22',
                    content: {
                        signature: '0xd4db55057a70c2963da3e96d8be646a5a477e989cc8bd9ea0c55a2b1c72666490292971b92fde4d453d81823e46f1390d6cea661b10fba136c1b99d9fe516eb71b',
                        idData: {
                            createdBy: '0x6717083A10aa3137E3748C41ac22B1bA73B5D6e7',
                            entriesHash: '0xe73e70e716abf61dc2bc8b11f0f2a862f58b061801daa3f77df0458a3ce5d699',
                            timestamp: 1535079201
                        }
                    }
                },
                {
                    bundleId: '0x1c17a07b3a50b44a25f0cb45f03400a01e9a330ebd8454d84bcb3565f9c7c48c',
                    content: {
                        signature: '0x1d9027d6bab52ecada447792be75358cd3344cfec643d70a2ef9e13d8434a1b90f26ce0ff36f2f8655827459dc879cb0d38094ed42c8fb9fc9cbffcecea7817c1c',
                        idData: {
                            createdBy: '0x6717083A10aa3137E3748C41ac22B1bA73B5D6e7',
                            entriesHash: '0x550178b7858fdbba745586ddd27a4cf4f59c7bb630a6c6b1d33a209a723b45be',
                            timestamp: 1545018801
                        }
                    }
                }
            ]
        );
        resolve();
    });
};

