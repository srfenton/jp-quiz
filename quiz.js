var fs = require('fs'); 
const { userInfo } = require('os');
const path = require('path');
const readline = require('readline');

let lessonCount = 1
let lessonBank = {}
// Define the directory path
const directoryPath = 'vocab/json';

// Read the contents of the directory
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }
  
  // Log the name of each file
  files.forEach(file => {
    if (path.extname(file).toLowerCase() === '.json'){
      console.log(lessonCount,'. ', file);
      lessonBank[lessonCount] = file;
      lessonCount++;}
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
  
  fs.readFile(`vocab/json/${lessonBank[parseInt(lessonChoice)]}`, 'utf8', function (err, file) {
    if (err) throw err;
    const vocabBank = JSON.parse(file)
    let japaneseTranslationArray = Object.keys(vocabBank['translations']);
    let englishTranslationArray = [];
    japaneseTranslationArray.forEach(element => {
      let formatted_element = vocabBank['translations'][element]//.trim().toLowerCase();
      englishTranslationArray.push(formatted_element);
    });



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
    let missedWordsList = [];

    function excludeCorrectAnswer(array, correctAnswer){
      return array.filter(item => item !== correctAnswer);
      }




    function nextWord(){
      if(currentIndex < 5) {
      // if(currentIndex < japaneseTranslationArray.length) { un-comment this line and comment out the one above for a longer test
        let currentWordEnglish = vocabBank['translations'][japaneseTranslationArray[currentIndex]]
        
        console.log(currentIndex+1,'. ',japaneseTranslationArray[currentIndex], ': \n');
        shuffle(englishTranslationArray);
        let incorrectAnswerPool = excludeCorrectAnswer(englishTranslationArray, currentWordEnglish);
        choices = [incorrectAnswerPool[0],incorrectAnswerPool[1],incorrectAnswerPool[2],currentWordEnglish];
        shuffle(choices);
        questionChoicesObject['a'] = choices[0]//.trim().toLowerCase();
        questionChoicesObject['b'] = choices[1]//.trim().toLowerCase();
        questionChoicesObject['c'] = choices[2]//.trim().toLowerCase();
        questionChoicesObject['d'] = choices[3]//.trim().toLowerCase();
        
        for (let choice in questionChoicesObject) {
          const question = questionChoicesObject[choice];
          console.log(`${choice}: ${question} \n`);
        };
      } else {
          console.log('that\'s all the words in the test');
          console.log(`\n score: ${correct} / ${correct+incorrect}`);
          console.log('\n your missedwords are: \n');
          missedWordsList.forEach(element => {
            console.log(`${element} : ${vocabBank['translations'][element]}`);
          });
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
        if (vocabBank['translations'][currentWord] === questionChoicesObject[userInput]){
          correct++;
          console.log('\n correct'); 
        } else {
          incorrect++;
          missedWordsList.push(currentWord)
          console.log('\n incorrect, ', vocabBank['translations'][currentWord], ' is the correct answer');
        }
        console.log('\n',correct, ' correct | ', incorrect, ' incorrect','\n')
        currentIndex++;
        nextWord();
      } else {
        console.log('\nplease enter a valid response.\n')
      }
      
    });
  }); 
});
