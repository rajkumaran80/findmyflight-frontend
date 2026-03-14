# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 8080
CMD ["npm", "run", "start"]
