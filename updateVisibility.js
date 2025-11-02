const { MongoClient } = require('mongodb');

async function main() {
  const client = new MongoClient('mongodb+srv://60301251:12class34@cluster0.j7qvb.mongodb.net/');
  await client.connect();
  const db = client.db('INFS3201_fall2025');
  const result = await db.collection('photos').updateMany({}, { $set: { visibility: 'public' } });
  console.log(`${result.modifiedCount} photos updated`);
  await client.close();
}

main();