/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var fs = require('fs'); 
const path = require('path');
const { userInfo } = require('os');

//initialize global test variables for testing
let testLength = 5;
let currentIndex = 0;
let correct = 0;
let incorrect = 0;
let missedWordsList = [];
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//this function reads the contents of a directory and returns an object them as the value of lesson number properties
function generateLessonBankObject() {
  let lessonCount = 1
  let lessonBank = {}
  const directoryPath = path.join(__dirname, 'vocab/json');
  // Read the contents of the directory
  try {
    const files = fs.readdirSync(directoryPath);
    files.forEach(file => {
        lessonBank[lessonCount] = file;
        lessonCount++;
    });
} catch (err) {
    console.error('Error reading directory:', err);
}

  return lessonBank;
};

// let lessonBank = generateLessonBankObject();
// console.log(lessonBank) //testing
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// the code below will generate the vocab arrays and object for the quiz
//NEW VERSION


function generateVocabBankObject(lessonChoice) {
  
  try {
    // Use readFileSync to read the file synchronously
    const file = fs.readFileSync(`vocab/json/${lessonChoice}`, 'utf8');
    
    // Parse the JSON file
    const vocabBank = JSON.parse(file);
    
    // Extract Japanese and English translations
    let japaneseTranslationArray = Object.keys(vocabBank['translations']);
    let englishTranslationArray = [];
    
    japaneseTranslationArray.forEach(element => {
        let formatted_element = vocabBank['translations'][element]; 
        englishTranslationArray.push(formatted_element);
    });

    // Return the result
    return {
        'japaneseTranslationArray': japaneseTranslationArray,
        'englishTranslationArray': englishTranslationArray,
        'vocabBank' : vocabBank
    };
} catch (err) {
    console.error('Error reading or parsing vocab file:', err);
    throw err; // Rethrow the error for handling in the calling function
}
}

// let vocabObject = generateVocabBankObject('lesson-1-vocab.json');
// let currentWord = 'だいがく';
// console.log(vocabObject.vocabBank.translations[currentWord]); //testing
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// function shuffle array
function shuffle(array) {
  for (let i = array.length-1; i > 0; i-- ) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// vocabBank[japaneseTranslationArray] = shuffle(vocabBank[japaneseTranslationArray]);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//function that excludes the correct answer when generating multiple choice answers
function excludeCorrectAnswer(array, correctAnswer){
  return array.filter(item => item !== correctAnswer);
  }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function generateQuizQuestionsObject(vocabBankObject){
  let quizQuestionsObject = {};
  vocabBankObject.japaneseTranslationArray = shuffle(vocabBankObject.japaneseTranslationArray);
  for(let i = 0; i < vocabBankObject.japaneseTranslationArray.length; i++){
    let questionChoicesObject = {};
    let choices = [];
    let currentWordEnglish = vocabBankObject.vocabBank.translations[vocabBankObject.japaneseTranslationArray[i]];
    let currentWordJapanese = vocabBankObject.japaneseTranslationArray[i];
    shuffle(vocabBankObject.englishTranslationArray);
    let incorrectAnswerPool = excludeCorrectAnswer(vocabBankObject.englishTranslationArray, currentWordEnglish);
    choices = [incorrectAnswerPool[0],incorrectAnswerPool[1],incorrectAnswerPool[2],currentWordEnglish];
    shuffle(choices);
    questionChoicesObject['a'] = choices[0].trim().toLowerCase();
    questionChoicesObject['b'] = choices[1].trim().toLowerCase();
    questionChoicesObject['c'] = choices[2].trim().toLowerCase();
    questionChoicesObject['d'] = choices[3].trim().toLowerCase();

    quizQuestionsObject[i+1] = { [currentWordJapanese] : questionChoicesObject } 
  }

  return quizQuestionsObject
}
// test = generateQuizQuestionsObject(generateVocabBankObject('lesson-6-vocab.json')) //clean all this up later
// currentWord = Object.keys(test[14])[0] //clean all this up later
// console.log(currentWord)
// console.log(test[14][currentWord]) //clean all this up later
// console.log(generateQuizQuestionsObject(generateVocabBankObject('lesson-6-vocab.json'))) //testing

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//core function of the quiz program
// function nextWord(){
//   while(currentIndex < testLength) {
//     let currentWordEnglish = vocabBank[japaneseTranslationArray[currentIndex]]
//     console.log(currentIndex+1,'. ',japaneseTranslationArray[currentIndex], ': \n');
//     shuffle(englishTranslationArray);
//     let incorrectAnswerPool = excludeCorrectAnswer(englishTranslationArray, currentWordEnglish);
//     choices = [incorrectAnswerPool[0],incorrectAnswerPool[1],incorrectAnswerPool[2],currentWordEnglish];
//     shuffle(choices);
//     questionChoicesObject['a'] = choices[0].trim().toLowerCase();
//     questionChoicesObject['b'] = choices[1].trim().toLowerCase();
//     questionChoicesObject['c'] = choices[2].trim().toLowerCase();
//     questionChoicesObject['d'] = choices[3].trim().toLowerCase();
    
//     for (let choice in questionChoicesObject) {
//       question = questionChoicesObject[choice];
//       console.log(`${choice}: ${question} \n`);
//     };
//   } 

  //return quizQuestions
// };
  
// nextWord();


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Export the functions
module.exports = {
  generateLessonBankObject,
  generateVocabBankObject,
  generateQuizQuestionsObject,currentIndex

};