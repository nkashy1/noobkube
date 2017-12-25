FROM node:8.9.3-alpine

ENV RANDOM_SERVER_URL=
ENV RANDINT_SERVER_PORT=8081

RUN mkdir -p /opt/randint-server

COPY . /opt/randint-server

WORKDIR /opt/randint-server

RUN npm install

ENTRYPOINT ["node", "index.js"]
