#!/bin/bash

echo "🔧 Initializing submodules..."

# Debug: Show current directory and git status
echo "Current directory: $(pwd)"
echo "Git status:"
git status --short

# Initialize and update submodules
echo "Running git submodule init..."
git submodule init

echo "Running git submodule update..."
git submodule update --recursive

# Verify submodules exist
if [ ! -d "stylus-by-example" ]; then
    echo "❌ stylus-by-example directory not found after submodule update"
    echo "Attempting to clone manually..."
    git clone https://github.com/offchainlabs/stylus-by-example.git stylus-by-example
fi

if [ ! -d "arbitrum-sdk" ]; then
    echo "❌ arbitrum-sdk directory not found after submodule update"
    echo "Attempting to clone manually..."
    git clone https://github.com/OffchainLabs/arbitrum-sdk.git arbitrum-sdk
fi

# List directories to verify
echo "📁 Listing directories:"
ls -la

# Check stylus-by-example structure
echo "📁 Checking stylus-by-example structure:"
if [ -d "stylus-by-example" ]; then
    echo "stylus-by-example exists"
    ls -la stylus-by-example/ | head -10
    
    if [ -d "stylus-by-example/src/app/basic_examples" ]; then
        echo "✅ stylus-by-example/src/app/basic_examples exists"
    else
        echo "❌ stylus-by-example/src/app/basic_examples NOT FOUND"
        echo "Checking what's in stylus-by-example:"
        find stylus-by-example -type d -name "basic_examples" 2>/dev/null || echo "No basic_examples found"
    fi
else
    echo "❌ stylus-by-example directory not found"
fi

echo "✅ Submodule initialization complete"