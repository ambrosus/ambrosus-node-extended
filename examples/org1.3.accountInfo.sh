#!/bin/bash

echo getting manager1Token ...
manager1Token=$(node ../src/getToken.js 0x2cf5e631b91b3f8c57c6a0205a22c06a4c073c24528bd0d6fc5b4da49612d26b)

echo getting regular1Token ...
regular1Token=$(node ../src/getToken.js 0x5a03a8f1bbc3e905e796a7b99fde0f8a3d8c4d5cd137d4d86d0cf53f6eb11e8d)

echo
echo
echo getInfo as manager other

curl --include \
     --request GET \
     --header "Content-Type: application/json" \
     --header "Accept: application/json" \
     --header "Authorization: AMB_TOKEN "$manager1Token \
'http://127.0.0.1:3000/account/0x2D2a0BE476559200D87EdD128Bd31c100be74e0f'

echo
echo
echo getInfo as user self

curl --include \
     --request GET \
     --header "Content-Type: application/json" \
     --header "Accept: application/json" \
     --header "Authorization: AMB_TOKEN "$regular1Token \
'http://127.0.0.1:3000/account/0x2D2a0BE476559200D87EdD128Bd31c100be74e0f'

echo
echo
echo getInfo as user other

curl --include \
     --request GET \
     --header "Content-Type: application/json" \
     --header "Accept: application/json" \
     --header "Authorization: AMB_TOKEN "$regular1Token \
'http://127.0.0.1:3000/account/0xC769C64a70ECA2606A927DC28DD947A5Dbec237B'