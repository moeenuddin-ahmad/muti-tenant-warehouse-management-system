# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache python3 make g++ \
    && npm install --legacy-peer-deps

COPY . .

RUN npm run build

# RUN npm prune --omit=dev


# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

USER node

ENV RUNNING_IN_DOCKER=true
ENV NODE_ENV=production

EXPOSE 3000

CMD [ "sh", "-c", "npm run migrate:up && npm run start:prod" ]

