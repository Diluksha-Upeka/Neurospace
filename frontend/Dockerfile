# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the Next.js app for production
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Command to start the Next.js server
CMD ["npm", "start"]
