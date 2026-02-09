#!/bin/bash
echo "Verifying configuration..."
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found"
  exit 1
fi
if [ ! -d "node_modules" ]; then
  echo "Warning: node_modules not found, running npm install..."
  npm install
fi
echo "Configuration verified."
