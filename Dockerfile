FROM node:10.15.3-alpine

RUN apk --update --no-cache add git python make g++

WORKDIR /app

COPY ./package.json /app/

RUN yarn install

COPY . ./

RUN yarn build

CMD ["yarn", "start:server"]
