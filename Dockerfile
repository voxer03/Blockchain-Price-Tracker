FROM node:20.11 as node-image

RUN npm i -g @nestjs/cli typescript ts-node
WORKDIR /server

COPY package.json /server/
COPY package-lock.json /server/

ARG NODE_ENV
RUN npm install

COPY . ./

CMD ["npm", "run", "start:dev"]