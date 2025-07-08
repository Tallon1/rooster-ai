#!/bin/bash
set -e

echo "🚀 Starting Rooster AI development servers..."

# Start Docker services if not running
docker-compose -f shared/docker/docker-compose.yml up -d

# Start development servers
pnpm dev
