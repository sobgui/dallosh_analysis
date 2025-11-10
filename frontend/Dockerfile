# Multi-stage build for Dallosh Analysis Frontend
# Using Bun runtime - see https://bun.com/guides/ecosystem/docker
FROM oven/bun:1 AS base
WORKDIR /project/frontend

# Install dependencies into temp directory for better caching
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock* /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock* /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Build Next.js application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Copy production dependencies and built application into final image
FROM base AS release
# Use --chown during COPY to set ownership immediately (much faster than chown -R)
# This avoids the slow chown step that was taking 13+ minutes
COPY --chown=bun:bun --from=install /temp/prod/node_modules node_modules
COPY --chown=bun:bun --from=prerelease /project/frontend/public ./public
COPY --chown=bun:bun --from=prerelease /project/frontend/.next ./.next
COPY --chown=bun:bun --from=prerelease /project/frontend/package.json ./package.json

# Run as bun user
USER bun

# Expose port
EXPOSE 3006

# Set environment variables
ENV PORT=3006
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Start the application using Bun
CMD ["bun", "run", "start"]
