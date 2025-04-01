FROM node:22.14.0

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npx", "ts-node", "src/server.ts"]