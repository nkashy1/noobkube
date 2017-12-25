FROM node:8.9.3-alpine

ENV RANDOM_SERVER_PORT=8080

RUN mkdir -p /opt/random-server

COPY . /opt/random-server

ENTRYPOINT ["node", "/opt/random-server/index.js"]
