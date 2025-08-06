# jp-quiz  
Japanese Vocabulary & Readings Quiz Web App  

A web-based Japanese learning tool designed to help you practice vocabulary and readings. Originally built as a Command Line Interface (CLI) app, it has evolved into a full-featured Express.js web application with MongoDB persistence.  

---

## Features  

- **Two Lesson Types**  
  - **Quiz** – Multiple-choice vocabulary practice.  
  - **Readings** – Reading comprehension passages from MongoDB.  

- **MongoDB-Backed Sessions**  
  - Tracks progress (`correct`, `incorrect`, `currentIndex`, missed words).  
  - Persists lesson choice, quiz state, and reading selection across page loads.  

- **Lesson Management**  
  - Pulls lessons from MongoDB (`quiz` vocab sets or `readings`).  
  - Supports combined lessons for larger quizzes.  

- **Multiple-Choice Quizzes**  
  - Randomized word order.  
  - Tracks correct and incorrect answers.  
  - Displays missed words for review.  

- **Session Reset**  
  - Easily reset quiz progress without restarting the server.  

---

## Installation  

1. **Install Node.js & MongoDB**  
   - [Node.js](https://nodejs.org/en)  
   - [MongoDB Community Server](https://www.mongodb.com/try/download/community)  

2. **Clone the Repository**  
   ```bash
   git clone https://github.com/yourusername/jp-quiz.git
   cd jp-quiz
   npm install
   ```

3. **Ensure MongoDB is Running**  
   The default connection URL is:  
   ```
   mongodb://localhost:27017/jpquiz
   ```  
   Change this in `app.js` or the import script if needed.  

---

## Running the Web App  

```bash
node app.js
```

Navigate to:  
[http://localhost:3000](http://localhost:3000)  

---

## Database Setup & Import Script  

A helper script is included to:  
- Drop and recreate collections.  
- Import **vocabulary** JSON files from `vocab/json/`.  
- Import **readings** JSON files from `readings/`.  

### **Script Location**  
Create a file named `importData.js` in the project root with the following:  

```js
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const url = "mongodb://localhost:27017/jpquiz";
const dbName = "jpquiz";
const vocabDir = path.join(__dirname, 'vocab/json');

async function manageCollection() {
  let db;
  try {
    db = await MongoClient.connect(url);
    const dbo = db.db(dbName);

    try {
      await dbo.collection("customers").drop();
      await dbo.collection("readings").drop();
      await dbo.collection("sessions").drop();
      await dbo.collection("vocab").drop();
      console.log("Collections deleted");
    } catch {
      console.log("Collection did not exist, skipping deletion");
    }

    await dbo.createCollection("customers");
    await dbo.createCollection("readings");
    await dbo.createCollection("vocab");
    await dbo.createCollection("sessions");
    console.log("Collections created");

    await dbo.collection("customers").insertOne({ name: "Admin" });
    console.log("Sample document inserted!");
  } finally {
    if (db) db.close();
  }
}

async function importVocabFiles() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const vocabCollection = db.collection("vocab");

    const files = fs.readdirSync(vocabDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(vocabDir, file), 'utf8'));
      await vocabCollection.updateOne(
        { englishTitle: file, japaneseTitle: data.title },
        { $set: data },
        { upsert: true }
      );
      console.log(`Imported vocab: ${file}`);
    }
  } finally {
    await client.close();
  }
}

async function importReadingsFiles() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const readingCollection = db.collection("readings");
    const readingsDir = 'readings';
    const files = fs.readdirSync(readingsDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(readingsDir, file), 'utf8'));
      for (const lessonKey in data) {
        const lesson = data[lessonKey];
        const lessonNumber = parseInt(lessonKey.replace("lesson_", ""));
        for (const reading of lesson.readings) {
          await readingCollection.updateOne(
            { lesson_number: lessonNumber, reading_number: reading.reading_number },
            { $set: {
                lesson_number: lessonNumber,
                lesson_title: lesson.title,
                reading_number: reading.reading_number,
                caption: reading.caption || "",
                japanese: reading.japanese,
                english: reading.english,
                kana: reading.kana
              }
            },
            { upsert: true }
          );
        }
      }
      console.log(`Imported reading file: ${file}`);
    }
  } finally {
    await client.close();
  }
}

async function run() {
  await manageCollection();
  await importVocabFiles();
  await importReadingsFiles();
  console.log("Database setup complete.");
}

run();
```

### **Run the Script**  
```bash
node importData.js
```

This will:  
- Drop existing collections.  
- Recreate `customers`, `readings`, `vocab`, `sessions`.  
- Insert an admin user in `customers`.  
- Import all vocab JSON files from `vocab/json/`.  
- Import all reading JSON files from `readings/`.  

---

## CLI Version (Optional)  

The original CLI quiz still exists and can be run with:  
```bash
node quiz.js
```  

