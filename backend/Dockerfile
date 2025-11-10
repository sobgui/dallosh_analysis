# Multi-stage build for Dallosh Analysis Backend
# Using Bun runtime - see https://bun.com/docs/guides/ecosystem/docker
FROM oven/bun:1 AS base
WORKDIR /project/backend

# Install dependencies into temp directory
# This will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /project/backend/temp/dev
COPY package.json bun.lock* /project/backend/temp/dev/
RUN cd /project/backend/temp/dev && bun install --frozen-lockfile

# Install with --production (exclude devDependencies)
RUN mkdir -p /project/backend/temp/prod
COPY package.json bun.lock* /project/backend/temp/prod/
RUN cd /project/backend/temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /project/backend/temp/dev/node_modules node_modules
COPY . .

# Build TypeScript
ENV NODE_ENV=production
RUN bun run build

# Copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /project/backend/temp/prod/node_modules node_modules
COPY --from=prerelease /project/backend/dist ./dist
COPY --from=prerelease /project/backend/package.json ./package.json

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 5006/tcp

ENV NODE_ENV=production

# Run as bun user
USER bun

# Start the application
ENTRYPOINT [ "bun", "run", "dist/index.js" ]
