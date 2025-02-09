const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const url = "mongodb://localhost:27017/jpquiz";
const dbName = "jpquiz";
const vocabDir = path.join(__dirname, 'vocab/json'); // Directory containing vocab JSON files

async function manageCollection() {
  let db;

  try {
    // Connect to the database
    db = await MongoClient.connect(url);
    const dbo = db.db(dbName);

    // Drop the collections if they exist
    try {
      await dbo.collection("customers").drop();
      await dbo.collection("readings").drop();
      await dbo.collection("sessions").drop();
      await dbo.collection("vocab").drop();
      console.log("Collections deleted");
    } catch (err) {
      console.log("Collection did not exist, skipping deletion");
    }

    // Create the collections again
    await dbo.createCollection("customers");
    console.log("Collection created!");
    await dbo.createCollection("readings");
    console.log("Collection created!");
    await dbo.createCollection("vocab");
    console.log("Collection created!");
    await dbo.createCollection("sessions");
    console.log("Collection created!");

    // Insert a sample document into the collection
    await dbo.collection("customers").insertOne({ name: "Admin" });
    console.log("Sample document inserted!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    if (db) {
      db.close();
    }
  }
}

async function importVocabFiles() {
  const client = new MongoClient(url);
  
  try {
      await client.connect();
      console.log("Connected to MongoDB");

      const db = client.db(dbName);
      const vocabCollection = db.collection("vocab");

      // Scan directory for JSON files
      const files = fs.readdirSync(vocabDir).filter(file => file.endsWith('.json'));

      for (const file of files) {
          const filePath = path.join(vocabDir, file);
          const fileData = fs.readFileSync(filePath, 'utf8');
          const vocabData = JSON.parse(fileData);

          // Use upsert to avoid duplicates (modify this as needed)
          await vocabCollection.updateOne(
              { englishTitle: file,
                japaneseTitle: vocabData.title },  // Assuming each file has a "title" field
              { $set: vocabData },
              { upsert: true }
          );

          console.log(`Imported: ${file}`);
      }

      console.log("Vocab import complete.");
  } catch (err) {
      console.error("Error importing vocab files:", err);
    } finally {
        await client.close();
    }
}

async function run() {
  await manageCollection(); // Drop and create collections
  await importVocabFiles(); // Import vocab files
  console.log('done...')
}

run();
