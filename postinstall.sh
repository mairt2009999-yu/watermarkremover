#!/bin/bash

echo "Running postinstall script..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate || true

# Copy Prisma engine files if needed
if [ "$VERCEL" = "1" ]; then
  echo "Running on Vercel, ensuring Prisma engines are available..."
  
  # Create .prisma/client directory if it doesn't exist
  mkdir -p node_modules/.prisma/client
  
  # Try to find and copy engine files
  find node_modules -name "libquery_engine-*" -type f 2>/dev/null | while read -r engine; do
    echo "Found engine: $engine"
    cp "$engine" node_modules/.prisma/client/ 2>/dev/null || true
  done
fi

# Run fumadocs-mdx
echo "Running fumadocs-mdx..."
fumadocs-mdx

echo "Postinstall completed!"