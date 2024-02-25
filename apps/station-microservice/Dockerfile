FROM node:20-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

ENV NODE_ENV="production"
ENV PORT 5001
EXPOSE ${PORT}

CMD [ "node", "main.js" ]