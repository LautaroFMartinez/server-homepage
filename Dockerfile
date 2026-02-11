FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache docker-cli curl && \
    curl -Lo /tmp/speedtest.tgz https://install.speedtest.net/app/cli/ookla-speedtest-1.2.0-linux-x86_64.tgz && \
    tar -xzf /tmp/speedtest.tgz -C /usr/local/bin speedtest && \
    rm /tmp/speedtest.tgz && \
    chmod +x /usr/local/bin/speedtest

COPY dist ./dist
COPY node_modules ./node_modules
COPY package.json ./

ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
