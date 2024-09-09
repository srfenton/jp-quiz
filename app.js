const express = require('express');
const { generateLessonBankObject, generateVocabBankObject, generateQuizQuestionsObject } = require('./quiz-web');
const path = require('path');
const app = express();
const port = 3000;

// Initialize quiz-related variables
let testLength = 5;            // Total number of quiz questions
let currentIndex = 0;          // Tracks current question index
let correct = 0;               // Correct answer counter
let incorrect = 0;             // Incorrect answer counter
let missedWordsList = [];      // Stores missed words for review
let lessonChoice = '';         // Holds the selected lesson file
let vocabBankObject = '';      // Holds vocab data for the current lesson
let questionNumber = '';       // Tracks the current question number
let quizQuestionsObject;       // Stores the generated quiz questions
let currentQuizQuestion = '';  // Stores the current quiz question
let currentWord = '';          // Current word in the quiz
let choices = '';              // Holds the choices for the current question

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the directory for views
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Home route - resets quiz state and renders the homepage
app.get('/', (req, res) => {
    currentIndex = 0;         // Reset current question index
    missedWordsList = [];     // Reset missed words list
    correct = 0;              // Reset correct answer count
    incorrect = 0;            // Reset incorrect answer count
    res.render('index');      // Render the homepage
});

// Route for selecting a lesson file
app.get('/selectlesson', (req, res) => {
    let lessonBank = generateLessonBankObject(); // Generate list of available lessons
    res.render('selectLesson', { jsonData: lessonBank }); // Render lesson selection page
});

// Route for starting the quiz with the selected lesson
app.post('/quiz/:lessonFile', async (req, res) => {
    lessonChoice = req.params.lessonFile; // Capture the selected lesson file
    try {
        // Generate vocab data and quiz questions
        vocabBankObject = await generateVocabBankObject(lessonChoice);
        quizQuestionsObject = await generateQuizQuestionsObject(vocabBankObject);
        res.redirect('/quiz/question/'); // Redirect to the first question
    } catch (error) {
        console.error('Error generating vocab object:', error);
        res.status(500).send('Internal Server Error'); // Error handling
    }
});

// Route for displaying the current quiz question
app.get('/quiz/question/', async (req, res) => {
    // Check if there are remaining questions
    let numberOfQuestions = Object.keys(quizQuestionsObject).length;
    if (currentIndex < numberOfQuestions) {
        questionNumber = currentIndex + 1;                 // Set the current question number
        currentQuizQuestion = quizQuestionsObject[questionNumber]; // Get the current question data
        currentWord = Object.keys(currentQuizQuestion)[0]; // Get the current Japanese word
        choices = quizQuestionsObject[questionNumber][currentWord]; // Get the answer choices
        correctAnswer = vocabBankObject.vocabBank.translations[currentWord].trim().toLowerCase(); // Correct answer

        console.log(`${correctAnswer} is the correctAnswer`); // Log correct answer for debugging

        try {
            // Render the question page with choices
            res.render('displayWord', { jsonData: choices, word: currentWord, questionNumber: questionNumber, numberOfQuestions: numberOfQuestions, correctAnswer: correct });
        } catch (error) {
            console.error('Error rendering question:', error);
            res.status(500).send('Internal Server Error'); // Error handling
        }
    } else {
        // If no more questions, render the summary page
        res.render('summary', { correct: correct, incorrect: incorrect, missedWordsList: missedWordsList });
    }
});

// Route for submitting an answer and checking correctness
app.post('/submit', async (req, res) => {
    let submittedAnswer = req.query.answer; // Get the submitted answer
    let correctAnswer = vocabBankObject.vocabBank.translations[currentWord].trim().toLowerCase(); // Correct answer
    let result = ''; // Initialize result as correct/incorrect

    try {
        // Check if the submitted answer is correct
        if (submittedAnswer === correctAnswer) {
            result = 'correct';
            correct++; // Increment correct answer count
        } else {
            result = 'false';
            incorrect++; // Increment incorrect answer count
            missedWordsList.push(`${currentWord} (${correctAnswer})`); // Add missed word to list
        }

        // Render the result page
        res.render('submit', { questionNumber: questionNumber, result: result });
        currentIndex++; // Move to the next question
    } catch (error) {
        console.error('Error processing submission:', error);
        res.status(500).send('Internal Server Error'); // Error handling
    }
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`); // Log the server URL
});