# Use an official Node.js image as the build environment
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json if present (optional, for future npm installs)
# COPY package*.json ./

# Copy all app files
COPY . .

# (Optional) If you have a build step (like React/Vue/Angular), run it here
# RUN npm install && npm run build

# Use a lightweight web server to serve static files
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy static site files to nginx public folder
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]