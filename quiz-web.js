var fs = require('fs'); 
const { userInfo } = require('os');




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//this function reads the contents of a directory and returns an object them as the value of lesson number properties
function generateLessonBankObject() {
  let lessonCount = 1
  let lessonBank = {}
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

  return lessonBank;

};

let lessonBank = generateLessonBankObject();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// the code below will generate the vocab arrays and object for the quiz
//NEW VERSION
function generateVocabObject(lessonBank, lessonChoice) {
  console.log('You have chosen, ', lessonBank[parseInt(lessonChoice)]);
  
  fs.readFile('vocab/' + lessonBank[parseInt(lessonChoice)], 'utf8', function (err, file) {
    if (err) throw err;
    
    let lines = file.split('\n');
    const vocabBank = {};
    let japaneseTranslationArray = [];
    let englishTranslationArray = [];
    
    lines.forEach(element => {
      let vocabulary = element.split(',');
      for (let i = 0; i < vocabulary.length; i += 2) {
        let japaneseWord = vocabulary[i];
        let englishWord = vocabulary[i + 1];
        
        japaneseWord = japaneseWord.trim();
        englishWord = englishWord.trim();
        englishWord = englishWord.toLowerCase();
        
        vocabBank[japaneseWord] = englishWord;
        japaneseTranslationArray.push(japaneseWord);
        englishTranslationArray.push(englishWord);
      }
    });
    
    return {
      'japaneseTranslationArray': japaneseTranslationArray,
      'englishTranslationArray': englishTranslationArray,
      'vocabBank': vocabBank
    };
  });
}

vocabObject = generateVocabObject(lessonBank, lessonChoice);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 






/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OLD VERSION
//the code below will generate the vocab arrays and object for the quiz
//   console.log('You have chosen, ', lessonBank[parseInt(lessonChoice)])
//   fs.readFile('vocab/'+lessonBank[parseInt(lessonChoice)], 'utf8', function (err, file) {
//     if (err) throw err;
//     let lines = file.split('\n');
//     const vocabBank = {};
//     let japaneseTranslationArray = [];
//     let englishTranslationArray = [];
//     let japananeseWord = '';
//     let englishWord = '';
//     lines.forEach(element => {
//       let vocabulary = element.split(',');
//       for (let i = 0; i < vocabulary.length; i+=2) {
//         japananeseWord = vocabulary[i];
//         englishWord = vocabulary[i+1];
//         japananeseWord = japananeseWord.trim();
//         englishWord = englishWord.trim();
//         englishWord = englishWord.toLowerCase();
//         vocabBank[japananeseWord]= englishWord;
//         japaneseTranslationArray.push(japananeseWord);
//         englishTranslationArray.push(englishWord);
//       };
//     });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//function shuffle array
//     function shuffle(array) {
//       for (let i = array.length-1; i > 0; i-- ) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [array[i], array[j]] = [array[j], array[i]];
//       }
//       return array;
//     };
    
//     shuffle(japaneseTranslationArray);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//initialize test variables
//these will most likely all need to moved into functions
//     let testLength = 5;
//     let currentIndex = 0;
//     let correct = 0;
//     let incorrect = 0;
//     let questionChoicesObject = {};
//     let choices = [];
//     let missedWordsList = [];
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//function that excludes the correct answer when generating multiple choice answers
//     function excludeCorrectAnswer(array, correctAnswer){
//       return array.filter(item => item !== correctAnswer);
//       }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//core function of the quiz program

//     function nextWord(){
//       if(currentIndex < testLength) {
//         let currentWordEnglish = vocabBank[japaneseTranslationArray[currentIndex]]
//         console.log(currentIndex+1,'. ',japaneseTranslationArray[currentIndex], ': \n');
//         shuffle(englishTranslationArray);
//         let incorrectAnswerPool = excludeCorrectAnswer(englishTranslationArray, currentWordEnglish);
//         choices = [incorrectAnswerPool[0],incorrectAnswerPool[1],incorrectAnswerPool[2],currentWordEnglish];
//         shuffle(choices);
//         questionChoicesObject['a'] = choices[0].trim().toLowerCase();
//         questionChoicesObject['b'] = choices[1].trim().toLowerCase();
//         questionChoicesObject['c'] = choices[2].trim().toLowerCase();
//         questionChoicesObject['d'] = choices[3].trim().toLowerCase();
        
//         for (let choice in questionChoicesObject) {
//           const question = questionChoicesObject[choice];
//           console.log(`${choice}: ${question} \n`);
//         };
//       } else {
//           console.log('that\'s all the words in the test');
//           console.log(`\n score: ${correct} / ${correct+incorrect}`);
//           console.log('\n your missedwords are: \n');
//           missedWordsList.forEach(element => {
//             console.log(`${element} : ${vocabBank[element]}`);
//           });
//           rl.close()
//           process.exit()
//       } 
//     };
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//     nextWord();


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//the below code is all nested underneath the some earlier functions because of the async nature of JS. Im not sure how this will be
//broken up yet, but the below code mostly checks to see if the answer the user provides is right
//     process.stdin.setEncoding('utf8');
    
//     let userInput = '';
//     let currentWord = '';
  
//     process.stdin.on('data', function(data) {
//       currentWord = japaneseTranslationArray[currentIndex];
//       // remove whitespace
//       userInput = data.trim();
//       //  remove make lower case
//       userInput = userInput.toLowerCase();
//       //convert user unput to vocab word
//       if(['a', 'b', 'c', 'd'].includes(userInput)){
//         if (vocabBank[currentWord] === questionChoicesObject[userInput]){
//           correct++;
//           console.log('\n correct'); 
//         } else {
//           incorrect++;
//           missedWordsList.push(currentWord)
//           console.log('\n incorrect, ', vocabBank[currentWord], ' is the correct answer');
//         }
//         console.log('\n',correct, ' correct | ', incorrect, ' incorrect','\n')
//         currentIndex++;
//         nextWord();
//       } else {
//         console.log('\nplease enter a valid response.\n')
//       }
      
//     });
//   }); 
// });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

