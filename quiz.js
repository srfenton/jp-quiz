var fs = require('fs'); 
const { userInfo } = require('os');
const readline = require('readline');

let lessonCount = 1
let lessonBank = {}
// Define the directory path
const directoryPath = 'vocab/';

// Read the contents of the directory
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }
  
  // Log the name of each file
  files.forEach(file => {
    console.log(lessonCount,'. ', file);
    lessonBank[lessonCount] = file;
    lessonCount++;
  });
  console.log('\n')
});
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Please enter the number corresponding to the lesson you wish to study: \n', (lessonChoice) => {

  lessonChoice = lessonChoice.trim();
  
  console.log('You have chosen, ', lessonBank[parseInt(lessonChoice)])
  fs.readFile('vocab/'+lessonBank[parseInt(lessonChoice)], 'utf8', function (err, file) {
    if (err) throw err;
    let lines = file.split('\n');
    const vocabBank = {};
    let japaneseTranslationArray = [];
    let englishTranslationArray = [];
    let japananeseWord = '';
    let englishWord = '';
    lines.forEach(element => {
      let vocabulary = element.split(',');
      for (let i = 0; i < vocabulary.length; i+=2) {
        japananeseWord = vocabulary[i];
        englishWord = vocabulary[i+1];
        japananeseWord = japananeseWord.trim();
        englishWord = englishWord.trim();
        englishWord = englishWord.toLowerCase();
        vocabBank[japananeseWord]= englishWord;
        japaneseTranslationArray.push(japananeseWord);
        englishTranslationArray.push(englishWord);
      };
    });
    


  console.log('\n');


    function shuffle(array) {
      for (let i = array.length-1; i > 0; i-- ) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
    
    shuffle(japaneseTranslationArray);
    
    let currentIndex = 0;
    let correct = 0;
    let incorrect = 0;
    let questionChoicesObject = {};
    let choices = [];

    function excludeCorrectAnswer(array, correctAnswer){
      return array.filter(item => item !== correctAnswer);
      }

    function nextWord(){
      if(currentIndex < 5) {
      // if(currentIndex < japaneseTranslationArray.length) { un-comment this line and comment out the one above for a longer test
        let currentWordEnglish = vocabBank[japaneseTranslationArray[currentIndex]]
        console.log(currentIndex+1,'. ',japaneseTranslationArray[currentIndex], ': \n');
        shuffle(englishTranslationArray);
        let incorrectAnswerPool = excludeCorrectAnswer(englishTranslationArray, currentWordEnglish);
        choices = [incorrectAnswerPool[0],incorrectAnswerPool[1],incorrectAnswerPool[2],currentWordEnglish];
        shuffle(choices);
        questionChoicesObject['a'] = choices[0].trim().toLowerCase();
        questionChoicesObject['b'] = choices[1].trim().toLowerCase();
        questionChoicesObject['c'] = choices[2].trim().toLowerCase();
        questionChoicesObject['d'] = choices[3].trim().toLowerCase();
        
        for (let choice in questionChoicesObject) {
          const question = questionChoicesObject[choice];
          console.log(`${choice}: ${question} \n`);
        };
      } else {
          console.log('that\'s all the words in the test');
          rl.close()
          process.exit()
      } 
    };

    nextWord();

    process.stdin.setEncoding('utf8');
    
    let userInput = '';
    let currentWord = '';
  
    process.stdin.on('data', function(data) {
      currentWord = japaneseTranslationArray[currentIndex];
      // remove whitespace
      userInput = data.trim();
      //  remove make lower case
      userInput = userInput.toLowerCase();
      //convert user unput to vocab word
      if(['a', 'b', 'c', 'd'].includes(userInput)){
        if (vocabBank[currentWord] === questionChoicesObject[userInput]){
          correct++;
          console.log('\n correct'); 
        } else {
          incorrect++;
          console.log('\n incorrect, ', vocabBank[currentWord], ' is the correct answer');
        }
        console.log('\n',correct, ' correct | ', incorrect, ' incorrect','\n')
        currentIndex++;
        nextWord();
      } else {
        console.log('\nplease enter a valid response.\n')
      }
      
    });
  }); 
  // rl.close();
});
