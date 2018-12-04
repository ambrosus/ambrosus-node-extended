FROM node:10

WORKDIR /app

COPY ./package.json /app/

RUN npm install

COPY . ./

RUN npm run build

CMD npm run start:server

