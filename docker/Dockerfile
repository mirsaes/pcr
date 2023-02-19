
FROM mirsaes/phototime-server
# docker build -t mirsaes/phototime -f docker/Dockerfile .

LABEL maintainer="mirsaes"
ENV NODE_ENV=production

WORKDIR /phototime-client-pcr
COPY dist .

COPY docker/docker-app-config.json /phototime-server/appConfig.json

WORKDIR /phototime-server/
