const express = require('express');
const { generateLessonBankObject, generateVocabBankObject, generateQuizQuestionsObject } = require('./quiz-web');
const path = require('path');
const app = express();
const port = 3000;
//initialize test values
let testLength = 5;
let currentIndex = 0;
let correct = 0;
let incorrect = 0;
let missedWordsList = [];
let lessonChoice = '';
let vocabBankObject = '';
let questionNumber = '';
let quizQuestionsObject;
let currentQuizQuestion = '';
let currentWord = '';
let choices = '';

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define the home route
app.get('/', (req, res) => {
    currentIndex = 0;
    missedWordsList = []; //reset this value
    correct = 0; //reset this value
    incorrect = 0;  //reset this value
    res.render('index');
});

// Define the JSON route
app.get('/selectlesson', (req, res) => {
    let lessonBank = generateLessonBankObject();
    res.render('selectLesson', { jsonData: lessonBank });
});

app.post('/quiz/:lessonFile', async (req, res) => {
    lessonChoice = req.params.lessonFile;
    try {
        vocabBankObject = await generateVocabBankObject(lessonChoice);
        quizQuestionsObject = await generateQuizQuestionsObject(vocabBankObject);
        res.redirect('/quiz/question/');
    } catch (error) {
        console.error('Error generating vocab object:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/quiz/question/', async (req, res) => {
    if(currentIndex < Object.keys(quizQuestionsObject).length){
        questionNumber = currentIndex + 1;
        currentQuizQuestion = quizQuestionsObject[questionNumber];
        currentWord = Object.keys(currentQuizQuestion)[0]
        choices = quizQuestionsObject[questionNumber][currentWord];
        correctAnswer = vocabBankObject.vocabBank.translations[currentWord].trim().toLowerCase()
        console.log(`${correctAnswer} is the correctAnswer`)
        try {
        res.render('displayWord', { jsonData: choices, word : currentWord, correctAnswer : correct });
        } catch (error) {
            console.error('Error generating vocab object:', error);
            res.status(500).send('Internal Server Error');
        }
    } else{
        res.render('summary', { correct: correct, incorrect : incorrect, missedWordsList: missedWordsList });
    }
});


// app.post('/submit/:answer', async (req, res) => {
app.post('/submit', async (req, res) => {
    // let submittedAnswer = req.params.answer;
    let submittedAnswer = req.query.answer;
    let correctAnswer = '';
    correctAnswer = vocabBankObject.vocabBank.translations[currentWord].trim().toLowerCase()
    let result = '';
    try {
        if(submittedAnswer===correctAnswer){
            result = 'correct';
            correct++
        }else{
            result = 'false';
            incorrect++
            missedWordsList.push(currentWord)
            console.log(`${submittedAnswer} was submitted`)
            console.log(`${correctAnswer} is correct`)
        }

        res.render('submit', { questionNumber: questionNumber, result : result });
        currentIndex++
    } catch (error) {
        console.error('Error generating vocab object:', error);
        res.status(500).send('Internal Server Error');
    }
});




// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
