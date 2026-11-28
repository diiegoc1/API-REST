FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN mkdir -p datos && chown node:node datos

ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "src/servidor.js"]