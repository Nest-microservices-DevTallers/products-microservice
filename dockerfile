FROM node:21-alpine3.19

WORKDIR /usr/src/app

COPY package-lock.json ./
COPY package.json ./

RUN npm i

COPY . .

RUN npx prisma generate

EXPOSE 3000