const express = require('express');
const session = require('express-session')
const crypto = require('crypto');
const { generateLessonBankObject, convertJSONToObject, generateVocabBankObject, generateQuizQuestionsObject, generateCombinedLessonsVocabBankObject, currentIndex } = require('./quiz-web');
const path = require('path');
const app = express();
const port = 3000;

// Session store (in memory, just for demonstration)
const sessionDataStore = {};

// Utility function to reset quiz state for a specific session ID
const resetQuizState = (sessionId) => {
    sessionDataStore[sessionId] = {
        currentIndex: 0,            // Tracks current question index
        correct: 0,                 // Correct answer counter
        incorrect: 0,               // Incorrect answer counter
        missedWordsList: [],        // Stores missed words for review
        lessonChoice: '',           // Holds the selected lesson file
        vocabBankObject: '',        // Holds vocab data for the current lesson
        questionNumber: '',         // Tracks the current question number       
        quizQuestionsObject: null,  // Stores the generated quiz question
        currentQuizQuestion: '',    // Stores the current quiz question
        currentWord: '',            // Current word in the quiz
        choices: ''                 // Holds the choices for the current question
    };
};


// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the directory for views
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

//Generate secret key
const secret = crypto.randomBytes(64).toString('hex');
console.log(secret); // Prints a secure 128-character string


// Configure `express-session`
app.use(session({
    secret: secret, // Replace with a strong secret key
    resave: false, // Avoid resaving session if it hasn't changed
    saveUninitialized: true, // Create a session even if nothing is stored
    cookie: { secure: false } // Set to `true` if using HTTPS
}));

// Home route - resets quiz state and renders the homepage
app.get('/', (req, res) => {
    // Create or retrieve the session ID
    if (!req.session.session_id) {
        req.session.session_id = `sess_${Math.random().toString(36).substr(2, 9)}`;
        console.log('New session created:', req.session.session_id);
    } else {
        console.log('Existing session:', req.session.session_id);
        
        if (req.session.session_id && sessionDataStore[req.session.session_id] && sessionDataStore[req.session.session_id]['questionNumber'] >= 1) {
            return res.redirect('/quiz/question');
        }
        
    }

    const sessionId = req.session.session_id;

    // Initialize session data in the sessionDataStore if it doesn't exist
    if (!sessionDataStore[sessionId]) {
        console.log('Initializing session data store for session ID:', sessionId);
        resetQuizState(sessionId);  // Initialize full quiz state if it's a new session
    } 

    // Render the homepage with relevant session and quiz state data
    res.render('index');
});


// Route for selecting a lesson file
app.get('/selectlesson', (req, res) => {
    const sessionId = req.session.session_id;
    sessionDataStore[sessionId]['lessonBank'] = generateLessonBankObject(); // Generate list of available lessons
    res.render('selectLesson', { jsonData: sessionDataStore[sessionId]['lessonBank'] }); // Render lesson selection page
});

// Route for starting the quiz with the selected lesson
app.post('/quiz/:lessonFile', async (req, res) => {
    const sessionId = req.session.session_id;
    sessionDataStore[sessionId]['lessonChoice'] = req.params.lessonFile; // Capture the selected lesson file

    try {
        // Generate vocab data and quiz questions
        if(sessionDataStore[sessionId]['lessonChoice'] !== 'combined'){
            sessionDataStore[sessionId]['lessonObject'] = convertJSONToObject(sessionDataStore[sessionId]['lessonChoice']);
            sessionDataStore[sessionId]['vocabBankObject'] = await generateVocabBankObject(sessionDataStore[sessionId]['lessonObject']);
        } else {
            sessionDataStore[sessionId]['vocabBankObject'] = generateCombinedLessonsVocabBankObject();
        }
        
        sessionDataStore[sessionId]['quizQuestionsObject'] = await generateQuizQuestionsObject(sessionDataStore[sessionId]['vocabBankObject']);
        res.redirect('/quiz/question/'); // Redirect to the first question
    } catch (error) {
        console.error('Error generating vocab object:', error);
        res.status(500).send('Internal Server Error'); // Error handling
    }
});

// Route for displaying the current quiz question
app.get('/quiz/question/', async (req, res) => {
    const sessionId = req.session.session_id;
    // Check if there are remaining questions
    let numberOfQuestions = Object.keys(sessionDataStore[sessionId]['quizQuestionsObject']).length;
    let currentIndex = sessionDataStore[sessionId]['currentIndex']
    if (currentIndex < numberOfQuestions) {
        // Set the current question number
        sessionDataStore[sessionId]['questionNumber'] = sessionDataStore[sessionId]['currentIndex'] + 1;                                                        
        // Get the current question data
        sessionDataStore[sessionId]['currentQuizQuestion'] = sessionDataStore[sessionId]['quizQuestionsObject'][currentIndex+1];
        // Get the current Japanese word
        sessionDataStore[sessionId]['currentWord'] = Object.keys(sessionDataStore[sessionId]['currentQuizQuestion'])[0];
        // Get the answer choices
        sessionDataStore[sessionId]['choices'] = sessionDataStore[sessionId]['quizQuestionsObject'][currentIndex+1][sessionDataStore[sessionId]['currentWord']];                           
        // Correct answer
        sessionDataStore[sessionId]['correctAnswer'] = sessionDataStore[sessionId]['vocabBankObject'].vocabBank.translations[sessionDataStore[sessionId]['currentWord']].trim().toLowerCase(); 
        // console.log(sessionDataStore)
        try {
            // Render the question page with choices
            res.render('displayWord', { jsonData: sessionDataStore[sessionId]['choices'], word: sessionDataStore[sessionId]['currentWord'], questionNumber: sessionDataStore[sessionId]['questionNumber'], numberOfQuestions: numberOfQuestions, correctAnswer: sessionDataStore[sessionId]['correct'] });
        } catch (error) {
            console.error('Error rendering question:', error);
            res.status(500).send('Internal Server Error'); // Error handling
        }
    } else {
        // If no more questions, render the summary page
        res.render('summary', { correct: sessionDataStore[sessionId]['correct'], incorrect: sessionDataStore[sessionId]['incorrect'], missedWordsList: sessionDataStore[sessionId]['missedWordsList'] });
    }
});

// Route for submitting an answer and checking correctness
app.post('/submit', async (req, res) => {
    const sessionId = req.session.session_id;
    let submittedAnswer = req.query.answer; // Get the submitted answer
    let currentWord = sessionDataStore[sessionId]['currentWord'];
    let vocabBankObject = sessionDataStore[sessionId]['vocabBankObject']
    sessionDataStore[sessionId]['correctAnswer'] = vocabBankObject.vocabBank.translations[currentWord].trim().toLowerCase(); // Correct answer
    let result = ''; // Initialize result as correct/incorrect

    try {
        // Check if the submitted answer is correct
        if (submittedAnswer === sessionDataStore[sessionId]['correctAnswer']) {
            result = 'correct';
            sessionDataStore[sessionId]['correct']++; // Increment correct answer count
        } else {
            result = 'false';
            sessionDataStore[sessionId]['incorrect']++; // Increment incorrect answer count
            sessionDataStore[sessionId]['missedWordsList'].push(`${sessionDataStore[sessionId]['currentWord']} (${sessionDataStore[sessionId]['correctAnswer']})`); // Add missed word to list
        }

        // Render the result page
        res.render('submit', { questionNumber: sessionDataStore[sessionId]['questionNumber'], result: result });
        sessionDataStore[sessionId]['currentIndex']++; // Move to the next question
    } catch (error) {
        console.error('Error processing submission:', error);
        res.status(500).send('Internal Server Error'); // Error handling
    }
});


app.post('/reset', async (req, res) => {
    const sessionId = req.session.session_id;
    
    //Ensure reset logic handles various session-related data removals
    if (sessionId) {
        resetQuizState(sessionId)
    }
    // Clear the session cookie if applicable
    res.clearCookie('session_id');
    
    // Redirect to the first question or home page
    res.redirect('/');
});




// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`); // Log the server URL
});