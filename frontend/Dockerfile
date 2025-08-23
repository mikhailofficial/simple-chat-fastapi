# Build stage
FROM node:22.17.1-alpine3.22 AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

RUN npm install

# Copy source code
COPY . .

# Build the application with environment variable
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
RUN npm run build

# Production stage
FROM node:22.17.1-alpine3.22

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist"]
