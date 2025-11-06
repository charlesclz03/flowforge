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

echo "5. Testing GET /api/sessions (fetch all sessions)..."
echo "------------------------------------------"
curl -s http://localhost:3000/api/sessions
echo ""
echo ""

echo "6. Testing POST /api/sessions (create new session)..."
echo "------------------------------------------"
curl -s -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "beatId": "beat-123",
    "title": "My First Session",
    "durationSeconds": 120,
    "frequency": 8,
    "difficulty": 2
  }'
echo ""
echo ""

echo "7. Testing GET /api/sessions again (should show created session)..."
echo "------------------------------------------"
curl -s http://localhost:3000/api/sessions
echo ""
echo ""

echo "=========================================="
echo "Tests complete!"
echo "=========================================="

