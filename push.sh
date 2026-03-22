#!/bin/bash

# Quick Auto-Push Script
if [ -z "$1" ]; then
  echo "❌ Error: Please provide a commit message."
  echo "💡 Usage: ./push.sh \"Your commit message here...\""
  exit 1
fi

echo "📦 Adding all changes..."
git add .

echo "💾 Committing with message: '$1'"
git commit -m "$1"

echo "🚀 Pushing to origin main..."
git push origin main

echo "✅ All done!"