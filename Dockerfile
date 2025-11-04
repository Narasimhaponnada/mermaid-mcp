# Multi-stage build for Mermaid MCP Connector + Server
# Optimized for Railway deployment with Puppeteer support

# Stage 1: Build stage
FROM node:18-slim AS builder

# Version tagging for build tracking (DevOps best practice)
ARG BUILD_VERSION=1.0.0
ARG BUILD_DATE
ARG GIT_COMMIT
LABEL version="${BUILD_VERSION}"
LABEL build_date="${BUILD_DATE}"
LABEL git_commit="${GIT_COMMIT}"

# Cache buster - change this to force rebuild
ARG CACHE_BUST=2025-11-05-GITHUB-DEPLOY-FRESH-BUILD
RUN echo "🏷️  Build Version: $BUILD_VERSION | Date: $BUILD_DATE | Commit: $GIT_COMMIT | Cache: $CACHE_BUST"

WORKDIR /build

# Copy all source code and dependencies
COPY mcp-connector ./connector/
COPY mermaid-mcp-server ./server/

# Install ALL dependencies (including dev) for building, with Puppeteer skip download
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN cd connector && npm ci --ignore-scripts && npm cache clean --force
RUN cd server && npm ci --ignore-scripts && npm cache clean --force

# Build TypeScript
RUN cd connector && npm run build
RUN cd server && npm run build

# Stage 2: Runtime with Chromium
FROM node:18-slim

# Install Chromium and required dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && ln -s /usr/bin/chromium /usr/bin/chromium-browser

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /build/connector ./connector
COPY --from=builder /build/server ./server

# Install production dependencies (includes puppeteer runtime)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN cd connector && npm ci --omit=dev --ignore-scripts && npm cache clean --force
RUN cd server && npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && chown -R appuser:appuser /app

# Set environment variables (including version info for runtime verification)
ENV NODE_ENV=production \
    PORT=3000 \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PUPPETEER_SKIP_DOWNLOAD=true \
    MCP_SERVER_PATH=/app/server/dist/index.js \
    BUILD_VERSION=${BUILD_VERSION} \
    BUILD_DATE=${BUILD_DATE} \
    GIT_COMMIT=${GIT_COMMIT}

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); });"

# Switch to non-root user
USER appuser

# Start the connector
WORKDIR /app/connector
CMD ["node", "dist/cli.js", "rest"]
# Railway rebuild - Tue Nov  4 17:15:00 +04 2025 - Force clean rebuild with crash fix
