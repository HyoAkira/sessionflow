// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("tas2");

db.getCollection('sessions').aggregate(
    [
        { $match: { clicks: { $type: 'array' } } },
        { $set: { clicks: { $size: '$clicks' } } }
    ],
    { maxTimeMS: 60000, allowDiskUse: true }
  );
  