#!/bin/bash

echo getting superToken ...
superToken=$(node ../src/getToken.js 0x0de26410466a2d3af29514bca8cd7fbafbc336cf77e156410f549000006842a8)

curl --include \
     --request POST \
     --header "Content-Type: application/json" \
     --header "Accept: application/json" \
     --data-binary "{ \
     \"address\": \"0xC769C64a70ECA2606A927DC28DD947A5Dbec237B\", \
     \"email\": \"test-org1@ambrosus.com\", \
     \"message\": \"TEST\", \
     \"title\": \"TEST-ORG-1\" \
}" \
'http://127.0.0.1:3000/organization/request'

curl --include \
     --request GET \
     --header "Content-Type: application/json" \
     --header "Accept: application/json" \
     --header "Authorization: AMB_TOKEN "$superToken \
'http://127.0.0.1:3000/organization/request/0xC769C64a70ECA2606A927DC28DD947A5Dbec237B/approve'
