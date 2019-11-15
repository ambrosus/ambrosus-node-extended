FROM node:10.15.2-alpine

RUN apk --update --no-cache add \
	git=2.18.1-r0 \
	python=2.7.15-r2 \
	make=4.2.1-r2 \
	g++=6.4.0-r9

WORKDIR /app

COPY ./package.json /app/

RUN yarn install

COPY . ./

RUN yarn build

CMD ["yarn", "start:server"]
