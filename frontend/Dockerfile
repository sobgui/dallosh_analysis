# Multi-stage build for Dallosh Analysis Frontend
# Using Node.js runtime (Next.js official support)
# Optimized for faster builds with BuildKit cache mounts
FROM node:20-alpine AS base
WORKDIR /project/frontend

# Install dependencies stage
FROM base AS install
COPY package.json ./
# Install dependencies
# Note: Not using cache mount due to npm cache corruption issues in BuildKit
# Docker layer caching will still speed up builds if package.json doesn't change
RUN npm install --legacy-peer-deps

# Build stage
FROM base AS prerelease
COPY --from=install /project/frontend/node_modules ./node_modules
COPY . .

# Build Next.js application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage - use minimal Node.js image
FROM node:20-alpine AS release
WORKDIR /project/frontend

# Create non-root user FIRST (before copying files)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy node_modules from install stage and prune dev dependencies
# This is faster than reinstalling everything
COPY --from=install /project/frontend/node_modules ./node_modules
COPY package.json ./
# Remove dev dependencies to reduce image size
RUN npm prune --production && \
    npm cache clean --force

# Copy built application (as root, then chown only specific dirs)
COPY --from=prerelease /project/frontend/public ./public
COPY --from=prerelease /project/frontend/.next ./.next

# Change ownership of necessary directories
# Note: We need to chown node_modules so nextjs user can read it
# This is still faster than the previous approach of chowning entire /project/frontend
RUN chown -R nextjs:nodejs /project/frontend/node_modules /project/frontend/.next /project/frontend/public && \
    chown nextjs:nodejs /project/frontend /project/frontend/package.json

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3006

# Set environment variables
ENV PORT=3006
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Start the application
CMD ["npm", "run", "start"]
