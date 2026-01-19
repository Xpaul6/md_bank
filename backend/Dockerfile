FROM node:21-alpine

WORKDIR /app

COPY package*.json ./
COPY content/ ./

RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
