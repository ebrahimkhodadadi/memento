# Stage 1: Build the application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the project
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the build output from the build stage to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to the outer world
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
