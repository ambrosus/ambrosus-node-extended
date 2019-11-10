#!/bin/bash

echo getting manager1Token ...
manager1Token=$(node ../src/getToken.js 0x2cf5e631b91b3f8c57c6a0205a22c06a4c073c24528bd0d6fc5b4da49612d26b)

curl --include \
     --request POST \
     --header "Content-Type: application/json" \
     --header "Accept: application/json" \
     --header "Authorization: AMB_TOKEN "$manager1Token \
     --data-binary "{ \
     \"address\": \"0x2D2a0BE476559200D87EdD128Bd31c100be74e0f\", \
     \"email\": \"email0f@domain.com\", \
     \"permissions\" : [\"create_asset\", \"create_event\"],
     \"accessLevel\": 100 \
}" \
'http://127.0.0.1:3000/account/create'