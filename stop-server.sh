#!/bin/bash

# Stop Next.js dev server
echo "Stopping Next.js dev server..."

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Kill any Next.js dev processes
pkill -f "next dev" 2>/dev/null

# Kill any node processes related to this project
pkill -f "node.*next" 2>/dev/null

echo "Server stopped (if it was running)"

