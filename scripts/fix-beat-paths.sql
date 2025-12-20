-- Run this in your Supabase SQL Editor to match the renamed files
UPDATE "Beat" 
SET "storageUrl" = REPLACE(REPLACE("storageUrl", ' ', '-'), '/beats/', '/beats/') 
WHERE "storageUrl" LIKE '% %';

-- Note: The replace logic handles the space to hyphen conversion.
-- Since we renamed "Battle .mp3" to "Battle-.mp3", this simple replace works.
-- "2 Naughty.mp3" -> "2-Naughty.mp3"
