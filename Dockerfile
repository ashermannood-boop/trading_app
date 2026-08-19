# 1. Use Node 22 (matching your current Railway environment)
FROM node:22-bookworm-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy the entire project into the container
COPY . .

# 4. Install Root dependencies (if any)
RUN npm install

# 5. Build the Frontend (React/Vite)
RUN cd client && npm install && npm run build

# 6. Install Backend dependencies
RUN cd backend && npm install

# 7. Set the environment to production
ENV NODE_ENV=production

# 8. Expose the port (Railway uses PORT env var, but we'll default to 5000)
EXPOSE 5000

# 9. Start the server from the backend folder
# This matches your server.js logic
CMD ["node", "backend/server.js"]