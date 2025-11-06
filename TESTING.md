# FlowForge API Testing Guide

## Quick Start

### 1. Start the dev server
```bash
# In terminal 1
DISABLE_DB=true NEXT_PUBLIC_SITE_URL=http://localhost:3000 npm run dev
```

Wait for the message: `✓ Ready in X ms`

### 2. Run the test script
```bash
# In terminal 2
./test-api.sh
```

Or run tests manually:

## Manual API Tests

### Test `/api/beats`
```bash
# Get all beats
curl http://localhost:3000/api/beats

# Get only free beats
curl "http://localhost:3000/api/beats?free=true"
```

**Expected Response:**
```json
{
  "beats": [
    {
      "id": "fallback-...",
      "title": "Lo-Fi Chill",
      "bpm": 85,
      "storageUrl": "/beats/placeholder.mp3",
      "isPremium": false,
      "genre": "Lo-Fi",
      ...
    }
  ],
  "count": 15
}
```

### Test `/api/words/random`
```bash
# Get 5 words with difficulty level 2
curl "http://localhost:3000/api/words/random?count=5&difficulty=2"

# Get 3 easy words (difficulty 1)
curl "http://localhost:3000/api/words/random?count=3&difficulty=1"

# Get 10 random words (any difficulty)
curl "http://localhost:3000/api/words/random?count=10"
```

**Expected Response:**
```json
{
  "words": [
    {
      "id": "w3",
      "wordText": "elevate",
      "syllableCount": 3,
      "difficultyLevel": 2,
      "category": "verb",
      "createdAt": "2025-11-06T..."
    }
  ],
  "count": 5
}
```

### Test `/api/sessions`

#### GET - Fetch all sessions
```bash
curl http://localhost:3000/api/sessions
```

**Expected Response (initially empty):**
```json
{
  "sessions": []
}
```

#### POST - Create a new session
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "beatId": "beat-123",
    "title": "My First Session",
    "durationSeconds": 120,
    "frequency": 8,
    "difficulty": 2
  }'
```

**Expected Response:**
```json
{
  "session": {
    "id": "local-...",
    "beatId": "beat-123",
    "title": "My First Session",
    "durationSeconds": 120,
    "frequency": 8,
    "difficulty": 2,
    "userId": null,
    "storageUrl": null,
    "createdAt": "2025-11-06T..."
  }
}
```

#### GET - Fetch sessions again (should show created session)
```bash
curl http://localhost:3000/api/sessions
```

**Expected Response:**
```json
{
  "sessions": [
    {
      "id": "local-...",
      "beatId": "beat-123",
      "title": "My First Session",
      "durationSeconds": 120,
      "frequency": 8,
      "difficulty": 2,
      "userId": null,
      "storageUrl": null,
      "createdAt": "2025-11-06T...",
      "beat": {
        "id": "beat-123",
        "title": "Local Beat",
        "bpm": 90,
        ...
      }
    }
  ]
}
```

## Browser Testing

Open these URLs in your browser while the dev server is running:
- http://localhost:3000/api/beats
- http://localhost:3000/api/words/random?count=5&difficulty=2
- http://localhost:3000/api/sessions

## Notes

- All tests use fallback data when `DISABLE_DB=true` is set
- Sessions are stored in-memory and will reset when the server restarts
- To test with a real database, remove `DISABLE_DB=true` and set `DATABASE_URL` in `.env.local`

## Troubleshooting

### "Connection refused"
- Make sure the dev server is running: `npm run dev`
- Check that it's listening on port 3000

### "Failed to fetch beats/words"
- Check the terminal running `npm run dev` for error messages
- Verify `DISABLE_DB=true` is set if you don't have a database

### Empty responses
- This is normal for `/api/sessions` on first run
- Create a session with POST, then GET should return it

