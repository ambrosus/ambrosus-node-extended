FROM node:14-alpine

WORKDIR /app

COPY ./package.json /app
COPY ./yarn.lock /app

RUN yarn install && yarn cache clean

COPY . ./

RUN yarn build

CMD ["yarn", "start:server"]
