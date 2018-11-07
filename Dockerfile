FROM node:10-alpine

WORKDIR /app

COPY ./package.json ./package-lock.json /app/

RUN npm install

COPY . ./

RUN npm run build

CMD ["npm", "run", "start:server"]
