FROM node:18-slim AS base
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN npm install --only=production --frozen-lockfile

FROM base AS build
RUN npm install --frozen-lockfile
RUN npm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
CMD [ "npm", "run", "start:prod" ]