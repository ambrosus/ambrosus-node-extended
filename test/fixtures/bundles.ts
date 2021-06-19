/* tslint:disable */
export const bundles = (collections: any) => {
    return new Promise(async (resolve, reject) => {
        await collections.bundle_metadata.insertMany(
            [
                {
                    "_id": "5c45f056fbd648001b26059b",
                    "bundleId": "0x0419a305e34825a2c4ba91f4a7202e9aa6ba698761e3f3484402d221acf4cf22",
                    "storagePeriods": 1,
                    "bundleProofBlock": 725850,
                    "bundleTransactionHash": "0xe73e70e716abf61dc2bc8b11f0f2a862f58b061801daa3f77df0458a3ce5d699",
                    "bundleUploadTimestamp": 1535079201
                },
                {
                    "_id": "6c45f056fbd648001b26059b",
                    "bundleId": "0x1c17a07b3a50b44a25f0cb45f03400a01e9a330ebd8454d84bcb3565f9c7c48c",
                    "storagePeriods": 1,
                    "bundleProofBlock": 725851,
                    "bundleTransactionHash": "0x550178b7858fdbba745586ddd27a4cf4f59c7bb630a6c6b1d33a209a723b45be",
                    "bundleUploadTimestamp": 1545018801
                },
            ]
        );
        resolve(void(0));
    });
};

