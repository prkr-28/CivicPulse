# Build the frontend [dist folder]
FROM node:20-alpine AS frontend-builder

COPY ./client /app

WORKDIR /app

RUN npm install

RUN npm run build

# Build the backend
FROM node:20-alpine

COPY ./server /app

WORKDIR /app

RUN npm install

COPY --from=frontend-builder /app/build /app/public

EXPOSE 3000

CMD ["node", "server.js"]


