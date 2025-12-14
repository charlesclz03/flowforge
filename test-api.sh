#!/bin/bash

echo "=========================================="
echo "FlowForge API Endpoint Tests"
echo "=========================================="
echo ""

echo "1. Testing GET /api/beats (all beats)..."
echo "------------------------------------------"
curl -s http://localhost:3000/api/beats | head -80
echo ""
echo ""

echo "2. Testing GET /api/beats?free=true (free beats only)..."
echo "------------------------------------------"
curl -s "http://localhost:3000/api/beats?free=true" | head -80
echo ""
echo ""

echo "3. Testing GET /api/words/random?count=5&difficulty=2..."
echo "------------------------------------------"
curl -s "http://localhost:3000/api/words/random?count=5&difficulty=2"
echo ""
echo ""

echo "4. Testing GET /api/words/random?count=3&difficulty=1..."
echo "------------------------------------------"
curl -s "http://localhost:3000/api/words/random?count=3&difficulty=1"
echo ""
echo ""

echo "5. Skipping /api/recordings (requires authenticated FormData request)"
echo "   → Use the browser or an authenticated client to test uploads."
echo ""
echo ""

echo "=========================================="
echo "Tests complete!"
echo "=========================================="

