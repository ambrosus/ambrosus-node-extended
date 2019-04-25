FROM node:10.14-alpine

RUN apk --update --no-cache add \
	git=2.18.1-r0 \
	python=2.7.15-r1 \
	make=4.2.1-r2 \
	g++=6.4.0-r9

WORKDIR /app

COPY ./package.json /app/

RUN npm install

COPY . ./

RUN npm run build

CMD ["npm", "run", "start:server"]
