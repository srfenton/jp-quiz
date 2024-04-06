var fs = require('fs'); 
const { userInfo } = require('os');

fs.readFile('lesson-3.txt', 'utf8', function (err, file) {
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
      japaneseTranslationArray.push(vocabulary[i]);
      englishTranslationArray.push(vocabulary[i+1]);
    };
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

  function nextWord(){
    if(currentIndex < 20) {
    // if(currentIndex < japaneseTranslationArray.length) { un-comment this line and comment out the one above for a longer test
      let currentWordEnglish = vocabBank[japaneseTranslationArray[currentIndex]]
      console.log(currentIndex+1,'. ',japaneseTranslationArray[currentIndex], ': \n');
      shuffle(englishTranslationArray);
      incorrectQuestionPool = englishTranslationArray;
      choicesAreUnqiue = false;
      while(choicesAreUnqiue == false){
        choices = [englishTranslationArray[0],englishTranslationArray[1],englishTranslationArray[2]]
        if(choices.includes(currentWordEnglish)){
          choices = []
          shuffle(englishTranslationArray);
        } else {
          choicesAreUnqiue = true;
        }
        choices.push(currentWordEnglish)
      } 
      // choices = [englishTranslationArray[0],englishTranslationArray[1],englishTranslationArray[2],currentWordEnglish];
      shuffle(choices);
      questionChoicesObject['a'] = choices[0].trim().toLowerCase();
      questionChoicesObject['b'] = choices[1].trim().toLowerCase();
      questionChoicesObject['c'] = choices[2].trim().toLowerCase();
      questionChoicesObject['d'] = choices[3].trim().toLowerCase();
      
      for (let choice in questionChoicesObject) {
        const question = questionChoicesObject[choice];
        console.log(`${choice}: ${question} \n`);
      };
      process.stdin.resume(); // Resume stdin to allow user input
    } else {
        console.log('that\'s all the words in the test');
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
  });
}); 


