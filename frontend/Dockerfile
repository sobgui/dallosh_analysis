# Multi-stage build for Dallosh Analysis Frontend
# Using Bun runtime - see https://bun.com/docs/guides/ecosystem/docker
FROM oven/bun:1 AS base
WORKDIR /project/frontend

# Install dependencies
FROM base AS install
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy node_modules and project files
FROM base AS prerelease
COPY --from=install /project/frontend/node_modules ./node_modules
COPY . .

# Build Next.js application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Copy dependencies and built application into final image
FROM base AS release
COPY --from=install /project/frontend/node_modules ./node_modules
COPY --from=prerelease /project/frontend/public ./public
COPY --from=prerelease /project/frontend/.next ./.next
COPY --from=prerelease /project/frontend/package.json ./package.json

# Set the correct permission for prerender cache
RUN chown -R bun:bun .next

# Run as non-root user
USER bun

# Expose port
EXPOSE 3006/tcp

ENV PORT=3006
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Start the application using Next.js start command
ENTRYPOINT [ "bun", "run", "start" ]
