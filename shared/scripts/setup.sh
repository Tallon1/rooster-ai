#!/bin/bash
set -e

echo "🚀 Setting up Rooster AI development environment..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start Docker services
echo "🐳 Starting Docker services..."
cd shared/docker
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run database migrations (we'll create these later)
echo "🗄️ Database is ready for migrations..."

echo "✅ Setup complete! Run 'pnpm dev' to start development."
