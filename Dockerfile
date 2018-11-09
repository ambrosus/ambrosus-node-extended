FROM node:10-alpine

RUN apk --update --no-cache add \
	git=2.15.3-r0 \
	python=2.7.15-r2 \
	make=4.2.1-r0 \
	g++=6.4.0-r5

WORKDIR /app

COPY ./package.json ./package-lock.json /app/

RUN npm install

COPY . ./

RUN npm run build

CMD ["npm", "run", "start:server"]
