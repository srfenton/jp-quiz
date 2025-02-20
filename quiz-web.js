var fs = require('fs'); 
const assert = require('assert');
const path = require('path');
const { userInfo } = require('os');
const { MongoClient } = require('mongodb');
const url = "mongodb://localhost:27017/jpquiz";
const dbName = "jpquiz";



// Function to read files from the vocabulary directory and return an object mapping lessons by number
function generateLessonBankObject(selectedOption) {
  let lessonCount = 1;  // Tracks the lesson number
  let lessonBank = {};  // Stores lesson files mapped to lesson numbers
  let scanDirectory;
  if(selectedOption === 'quiz'){
    scanDirectory = 'vocab/json';
  } else{
    scanDirectory = 'readings';
  }
  const directoryPath = path.join(__dirname, scanDirectory); // Path to vocabulary directory
  
  try {
    // Read and store each file in the directory
    const files = fs.readdirSync(directoryPath);
    files.forEach(file => {
      lessonBank[lessonCount] = file;
      lessonCount++;
    });
  } catch (err) {
    console.error('Error reading directory:', err); // Error handling
  }
  return lessonBank;
};

async function generateLessonBankObjectDb(selectedOption) {
  let client;
  let lessonCount = 1;  // Tracks the lesson number
  let lessonBank = {};
  try {
    client = new MongoClient(url);
    await client.connect();
    console.log("Connected to MongoDB to generate lesson bank");

    const db = client.db(dbName);
    let distinctTitles;
    if(selectedOption ==='readings'){
      distinctTitles = await db.collection("readings").distinct("lesson_title");
    } else{ 
      distinctTitles = await db.collection("vocab").distinct("englishTitle");
    }
    distinctTitles.forEach(lesson => {
      lessonBank[lessonCount] = lesson;
      lessonCount++;
    });
    // console.log(lessonBank);
  
    return lessonBank;

  } catch (err) {
    console.error('Error fetching distinct titles:', err);
    throw err;
  } finally {
    if (client) {
      await client.close();
    }
  }
}


//this function should act as a shim to make more use of out of the generate vocabBankObject() function.
function convertJSONToObject(lessonChoice) {
  try {
    // Read the selected lesson file
    const file = fs.readFileSync(`vocab/json/${lessonChoice}`, 'utf8');

    return JSON.parse(file); // Parse JSON content

  } catch (err) {
  console.error('Error reading or parsing vocab file:', err); // Error handling
  throw err;
  } 
}

async function convertCollectionToObject(lessonChoice) {
  let client;

  try {
    // Initialize the MongoClient and connect to the database
    client = new MongoClient(url);
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const result = await db.collection("vocab").findOne({ englishTitle: lessonChoice });

    if (result) {
      console.log(`result found: ${result.title}`)
      return result;  // Return the result as an object
    } else {
      console.log("No document found for the lesson choice");
      return null;  // Return null if no document is found
    }

  } catch (err) {
    console.error('Error reading or parsing vocab file:', err); // Error handling
    throw err;
  } finally {
    // Ensure that the MongoDB connection is closed
    if (client) {
      await client.close();
    }
  }
}


// Function to read a selected lesson object and extract Japanese/English translations for quiz
function generateVocabBankObject(vocabBank) {
  try {

    // Create arrays for Japanese and corresponding English translations
    let japaneseTranslationArray = Object.keys(vocabBank['translations']);
    let englishTranslationArray = japaneseTranslationArray.map(element => vocabBank['translations'][element]);

    // Return structured vocab data for the quiz
    return {
      'japaneseTranslationArray': japaneseTranslationArray,
      'englishTranslationArray': englishTranslationArray,
      'vocabBank': vocabBank
    };
  } catch (err) {
    console.error('Error reading or parsing vocab file:', err); // Error handling
    throw err;
  }
}


//create a combination of all lessons
function generateCombinedLessonsVocabBankObject(){
  let combinedLessonsVocabBankObject = {"title" : "combined", "translations" : {}};
  let currentLesson;
  const directoryPath = path.join(__dirname, 'vocab/json'); // Path to vocabulary directory

  try {
    // Read and store each file in the directory
    const files = fs.readdirSync(directoryPath);
    files.forEach(file => {
      //the below variable should be the current json as the loop iterates through all of them
      currentLesson = fs.readFileSync(`vocab/json/${file}`, 'utf8');
      currentLesson = JSON.parse(currentLesson);
      //the below line combines the translations values with the currentLesson ones
      combinedLessonsVocabBankObject.translations = {...combinedLessonsVocabBankObject.translations,...currentLesson.translations};
      
    });
  } catch (err) {
    console.error('Error reading directory:', err); // Error handling
  }
  return generateVocabBankObject(combinedLessonsVocabBankObject)

}


async function generateCombinedLessonsVocabBankObjectDb() {
  let combinedLessonsVocabBankObject = { "title": "combined", "translations": {} };
  let currentLesson;
  const client = new MongoClient(url);

  try {
    // Connect to MongoDB
    const client = new MongoClient(url);
    await client.connect();
    console.log("Connected to MongoDB to generate lesson bank");

    const db = client.db(dbName);
    const distinctTitles = await db.collection("vocab").distinct("englishTitle");

    // Use for...of loop for async operations
    for (let lesson of distinctTitles) {
      currentLesson = await convertCollectionToObject(lesson);
      combinedLessonsVocabBankObject.translations = {
        ...combinedLessonsVocabBankObject.translations,
        ...currentLesson.translations
      };
    }

    // Call the next function
    const result = await generateVocabBankObject(combinedLessonsVocabBankObject);

    // Return the result
    return result;

  } catch (err) {
    console.error('Database connection error:', err); // Error handling
    throw err; // Optionally re-throw the error to handle it in the calling function
  } finally {
    // Ensure MongoDB client is closed even if an error occurs
    if (client) {
      await client.close();
      console.log("MongoDB client closed");
    }
  }
}




// Utility function to shuffle an array using the Fisher-Yates algorithm
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

// Function to remove the correct answer from the answer pool for multiple-choice generation
function excludeCorrectAnswer(array, correctAnswer) {
  return array.filter(item => item !== correctAnswer); // Exclude correct answer
}

// Function to generate quiz questions from a vocab bank, with shuffled choices
function generateQuizQuestionsObject(vocabBankObject) {
  let quizQuestionsObject = {}; // Stores quiz questions
  vocabBankObject.japaneseTranslationArray = shuffle(vocabBankObject.japaneseTranslationArray); // Shuffle question order
  
  // Loop through each Japanese word to generate a question
  for (let i = 0; i < vocabBankObject.japaneseTranslationArray.length; i++) {
    let questionChoicesObject = {}; // Stores multiple-choice options
    let currentWordEnglish = vocabBankObject.vocabBank.translations[vocabBankObject.japaneseTranslationArray[i]];
    let currentWordJapanese = vocabBankObject.japaneseTranslationArray[i];

    // Prepare answer choices (3 incorrect + 1 correct)
    let incorrectAnswerPool = excludeCorrectAnswer(vocabBankObject.englishTranslationArray, currentWordEnglish);
    incorrectAnswerPool = shuffle(incorrectAnswerPool);
    let choices = [incorrectAnswerPool[0], incorrectAnswerPool[1], incorrectAnswerPool[2], currentWordEnglish];
    shuffle(choices); // Shuffle the answer choices
    
    // Assign shuffled choices to answer options 'a', 'b', 'c', and 'd'
    questionChoicesObject['a'] = choices[0].trim().toLowerCase();
    questionChoicesObject['b'] = choices[1].trim().toLowerCase();
    questionChoicesObject['c'] = choices[2].trim().toLowerCase();
    questionChoicesObject['d'] = choices[3].trim().toLowerCase();

    // Store the question and its choices in the quiz object
    quizQuestionsObject[i + 1] = { [currentWordJapanese]: questionChoicesObject };
  }

  return quizQuestionsObject;
}






// Export functions for use in other parts of the application
module.exports = {
  generateLessonBankObject,
  generateLessonBankObjectDb,
  convertJSONToObject,
  convertCollectionToObject,
  generateVocabBankObject,
  generateQuizQuestionsObject,
  generateCombinedLessonsVocabBankObject,
  generateCombinedLessonsVocabBankObjectDb
};


//testing functions:
// let lessonChoice = convertJSONToObject('lesson-1-vocab.json')
// let vObject = generateVocabBankObject(lessonChoice)
// console.log(vObject)
// console.log(generateCombinedLessonsVocabBankObject())

//2-8 testing
// let lessonChoice = convertCollectionToObject('lesson-1-vocab.json')
//// console.log('1: \n');
// let testLessonBank1 = generateLessonBankObject();
// console.log('2: \n');
//let testLessonBank2 = generateLessonBankObjectDb();


// async function checkLessonBanks() {
//   let testLessonBank2 = await generateLessonBankObjectDb();  // Await the Promise
  
//   // Compare the two lesson banks after awaiting the Promise
//   assert.deepStrictEqual(testLessonBank1, testLessonBank2, 'The lesson banks are not deeply equal!');
  
//   console.log('Lesson banks are deeply equal!');
// }

// // Call the async function
// checkLessonBanks().catch(err => console.error(err));


//testing the combined vocab object updates 
// async function checkCombinedVocabObjects() {
//   let inMemory = generateCombinedLessonsVocabBankObject();
//   let db = await generateCombinedLessonsVocabBankObjectDb();  // Await the Promise
  
//   // Compare the two lesson banks after awaiting the Promise
//   assert.deepStrictEqual(inMemory, db, 'The objects are not deeply equal!');
  
//   console.log('the objects are deeply equal!');
// }

// // Call the async function
// checkCombinedVocabObjects().catch(err => console.error(err));