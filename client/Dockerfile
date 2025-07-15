# Stage 1: Build the Vite app
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Vite (development server)
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app /app

RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev"]
