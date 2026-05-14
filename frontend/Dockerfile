FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_PUBLIC_API_URL=http://localhost:4000
ENV PORT=5000

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Run Next.js in dev mode
CMD ["npm", "run", "dev"]
