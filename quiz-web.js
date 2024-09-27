var fs = require('fs'); 
const path = require('path');
const { userInfo } = require('os');

// Global variables for quiz tracking
let testLength = 5;      // Number of quiz questions
let currentIndex = 0;    // Tracks current quiz question index
let correct = 0;         // Correct answer counter
let incorrect = 0;       // Incorrect answer counter
let missedWordsList = []; // List to store missed words

// Function to read files from the vocabulary directory and return an object mapping lessons by number
function generateLessonBankObject() {
  let lessonCount = 1;  // Tracks the lesson number
  let lessonBank = {};  // Stores lesson files mapped to lesson numbers
  const directoryPath = path.join(__dirname, 'vocab/json'); // Path to vocabulary directory
  
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

//this function should act as a shim to make more use of out of the generate vocabBankObject() function.
function convertJSONToObject (lessonChoice) {
  try {
    // Read the selected lesson file
    const file = fs.readFileSync(`vocab/json/${lessonChoice}`, 'utf8');
    const vocabBank = JSON.parse(file); // Parse JSON content

} catch (err) {
  console.error('Error reading or parsing vocab file:', err); // Error handling
  throw err;
}

  return vocabBank
}


// Function to read a selected lesson file and extract Japanese/English translations for quiz
// function generateVocabBankObject(lessonChoice) {
function generateVocabBankObject(vocabBank) {
  try {
    // Read the selected lesson file
        // const file = fs.readFileSync(`vocab/json/${lessonChoice}`, 'utf8');
    // const vocabBank = JSON.parse(file); // Parse JSON content

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
      console.log(currentLesson)
      //the below line combines the translations values with the currentLesson ones
      combinedLessonsVocabBankObject.translations = {...combinedLessonsVocabBankObject.translations,...currentLesson.translations};
      
    });
  } catch (err) {
    console.error('Error reading directory:', err); // Error handling
  }
  return generateVocabBankObject(combinedLessonsVocabBankObject)

}

console.log(generateCombinedLessonsVocabBankObject())

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
  generateVocabBankObject,
  generateQuizQuestionsObject,
  currentIndex
};
