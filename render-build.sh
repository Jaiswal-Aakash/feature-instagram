#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies for all parts
npm run install-all

# Build the React app
npm run build

echo "Build completed successfully!"
