#!/bin/bash

# Prebuild script for Railway deployment
# This script checks if DATABASE_URL is PostgreSQL and switches the schema accordingly

echo "🔧 Running prebuild script..."

# Check if DATABASE_URL contains postgresql
if echo "$DATABASE_URL" | grep -q "postgres"; then
    echo "📦 Detected PostgreSQL database, switching schema..."
    cp prisma/schema.postgresql.prisma prisma/schema.prisma
    echo "✅ Schema switched to PostgreSQL"
else
    echo "📦 Using SQLite schema for local development"
fi

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

echo "✅ Prebuild complete!"
