const express = require('express');
const session = require('express-session')
const crypto = require('crypto');
const { generateLessonBankObject, generateLessonBankObjectDb, convertJSONToObject, convertCollectionToObject, generateVocabBankObject, generateQuizQuestionsObject, generateCombinedLessonsVocabBankObject, generateCombinedLessonsVocabBankObjectDb, currentIndex } = require('./quiz-web');
const path = require('path');
const app = express();
const port = 3000;
const { MongoClient } = require('mongodb');
const url = "mongodb://localhost:27017/jpquiz";

async function connectToDb() {
    try {
        const client = await MongoClient.connect(url);
        dbo = client.db("jpquiz");
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Database connection error:", err);
    }
}

connectToDb();
    

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

async function resetQuizStateDb(sessionId) {
    await dbo.collection("sessions").updateOne(
        { sessionId: sessionId },
        { $set: {
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
     }},
     { upsert: true }                   // Creates a new document if none exists
    );
};



async function incrementColumn(sessionId, column) {
    await dbo.collection("sessions").updateOne(
        { sessionId: sessionId },
        { $inc: { [column]: 1 } },  // Increment the specified column by 1
        { upsert: true }            // Creates a new document if none exists
    );
};



async function getSession(req, res, dbo) {
    if (!req.session.session_id) {
        req.session.session_id = `sess_${Math.random().toString(36).substr(2, 9)}`;
        console.log('New session created:', req.session.session_id);
    } else {
        console.log('Existing session:', req.session.session_id);
        
        const sessionExists = await dbo.collection("sessions").findOne({ sessionId: req.session.session_id });
        if (sessionExists && sessionExists.questionNumber >= 1) {
            console.log('Session exists, question number: ' + sessionExists.questionNumber);
            return res.redirect(`/quiz/question/`);
        }
    }

    return req.session.session_id; // Return the session ID for further use
}


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


app.get('/', async (req, res) => {
    const sessionId = await getSession(req, res, dbo);
    if (!sessionId) return; // Stops execution if redirected in the function
    const sessionData = await dbo.collection("sessions").findOne({ sessionId });

    if (!sessionData) {
        console.log('Initializing session data in MongoDB for session ID:', sessionId);
        resetQuizStateDb(sessionId); 
    }

    res.render('index');
});





// Route for selecting a lesson file
app.get('/selectlesson', async (req, res) => {
    const sessionId = req.session.session_id;
    getSession(req, res, dbo);

    // sessionDataStore[sessionId]['lessonBank'] = generateLessonBankObject(); // Generate list of available lessons
    const lessonBank = await generateLessonBankObjectDb();

    // Update MongoDB with the new lessonBank
    await dbo.collection("sessions").updateOne(
        { sessionId: sessionId }, 
        { $set: { lessonBank: lessonBank } }, 
        { upsert: true } // Create document if it doesn't exist
    );

    // Corrected closing brackets
    res.render('selectLesson', { jsonData: lessonBank }); // Render lesson selection page
});


// Route for starting the quiz with the selected lesson
app.post('/quiz/:lessonFile', async (req, res) => {
    const sessionId = req.session.session_id;
    //sessionDataStore[sessionId]['lessonChoice'] = req.params.lessonFile; // Capture the selected lesson file
    let lessonChoice = req.params.lessonFile; // Capture the selected lesson file

    await dbo.collection("sessions").updateOne(
        { sessionId: sessionId }, 
        { $set: { lessonChoice: lessonChoice } }, 
        { upsert: true } // Create document if it doesn't exist
    );


    try {
        // Generate vocab data and quiz questions
            if(lessonChoice !== 'combined'){

            lessonObject = await convertCollectionToObject(lessonChoice);
            console.log(lessonObject);
            await dbo.collection("sessions").updateOne(
                { sessionId: sessionId }, 
                { $set: { lessonObject: lessonObject } }, 
                { upsert: true } // Create document if it doesn't exist
            );
            
            vocabBankObject = await generateVocabBankObject(lessonObject);
            await dbo.collection("sessions").updateOne(
                { sessionId: sessionId }, 
                { $set: { vocabBankObject: vocabBankObject } }, 
                { upsert: true } // Create document if it doesn't exist
            );
        } else {
            vocabBankObject = await generateCombinedLessonsVocabBankObjectDb();

            await dbo.collection("sessions").updateOne(
                { sessionId: sessionId }, 
                { $set: { vocabBankObject: vocabBankObject } }, 
                { upsert: true } // Create document if it doesn't exist
            );

        }
        
        quizQuestionsObject = await generateQuizQuestionsObject(vocabBankObject);
        console.log(vocabBankObject + 'is vocabBankObject');
        await dbo.collection("sessions").updateOne(
            { sessionId: sessionId }, 
            { $set: { quizQuestionsObject: quizQuestionsObject } }, 
            { upsert: true } // Create document if it doesn't exist
        );

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

    let quizQuestionsObject = await dbo.collection('sessions').findOne(
        { sessionId: sessionId }, 
        { projection: { quizQuestionsObject: 1, _id: 0 } }
    );
    console.log('Keys:', Object.keys(quizQuestionsObject.quizQuestionsObject));

    let numberOfQuestions = Object.keys(quizQuestionsObject?.quizQuestionsObject || {}).length;   
    
    let sessionData = await dbo.collection('sessions').findOne(
        { sessionId: sessionId }, 
        { projection: { currentIndex: 1,quizQuestionsObject: 1, _id: 0 } }
    );
    
    let currentIndex = sessionData.currentIndex;



    if (currentIndex < numberOfQuestions) {
        // Set the current question number
        questionNumber = currentIndex+1;
        await dbo.collection("sessions").updateOne(
            { sessionId: sessionId }, 
            { $set: { questionNumber: questionNumber } }, 
            { upsert: true } // Create document if it doesn't exist
        );

        // Get the current question data
        currentQuizQuestion = sessionData.quizQuestionsObject[currentIndex+1];
        await dbo.collection("sessions").updateOne(
            { sessionId: sessionId }, 
            { $set: { currentQuestion: currentQuizQuestion } }, 
            { upsert: true } // Create document if it doesn't exist
        );
        // Get the current Japanese word
        console.log('current quiz question' + currentQuizQuestion)
        currentWord = Object.keys(currentQuizQuestion)[0];
        await dbo.collection("sessions").updateOne(
            { sessionId: sessionId }, 
            { $set: { currentWord: currentWord } }, 
            { upsert: true } // Create document if it doesn't exist
        );

    
        // Get the answer choices
        choices = sessionData.quizQuestionsObject[currentIndex+1][currentWord];                           
        await dbo.collection("sessions").updateOne(
            { sessionId: sessionId }, 
            { $set: { choices: choices } }, 
            { upsert: true } // Create document if it doesn't exist
        );        
        // Correct answer
        correctAnswer = vocabBankObject.vocabBank.translations[currentWord].trim().toLowerCase(); 
        await dbo.collection("sessions").updateOne(
            { sessionId: sessionId }, 
            { $set: { correctAnswer: correctAnswer } }, 
            { upsert: true } // Create document if it doesn't exist
        );

        
        
        try {
            // Render the question page with choices
            res.render('displayWord', { jsonData: choices, word: currentWord, questionNumber: questionNumber, numberOfQuestions: numberOfQuestions, correctAnswer: correctAnswer});
        } catch (error) {
            console.error('Error rendering question:', error);
            res.status(500).send('Internal Server Error'); // Error handling
        }
    } else {
        // If no more questions, render the summary page
        sessionData = await dbo.collection('sessions').findOne(
            { sessionId: sessionId }, 
            { projection: { correct: 1, incorrect: 1, missedWordsList: 1, _id: 0 } }
        );
        
        let correct = 0;  
        let incorrect = 0;  
        let missedWordsList = [];  
        
        if (sessionData) {
            correct = parseInt(sessionData.correct) || 0;  
            incorrect = parseInt(sessionData.incorrect) || 0;  
            missedWordsList = Array.isArray(sessionData.missedWordsList) ? sessionData.missedWordsList : [];
        }
        
        res.render('summary', { correct: correct, incorrect: incorrect, missedWordsList: missedWordsList });
    }
});

// Route for submitting an answer and checking correctness
app.post('/submit', async (req, res) => {
    const sessionId = req.session.session_id;
    let sessionData = await dbo.collection('sessions').findOne(
        { sessionId: sessionId }, 
        { projection: { currentIndex:1, currentWord: 1, vocabBankObject: 1, missedWordsList: 1, correctAnswer:1, questionNumber:1, _id: 0 } }
    );

    let submittedAnswer = req.query.answer; // Get the submitted answer
    let currentIndex = sessionData.currentIndex;
    // let currentWord = sessionDataStore[sessionId]['currentWord'];
    let currentWord = sessionData.currentWord;
    // let vocabBankObject = sessionDataStore[sessionId]['vocabBankObject']
    let vocabBankObject = sessionData.vocabBankObject;
    // sessionDataStore[sessionId]['correctAnswer'] = vocabBankObject.vocabBank.translations[currentWord].trim().toLowerCase(); // Correct answer
    let correctAnswer = sessionData.correctAnswer;
    let questionNumber = sessionData.questionNumber;
    let result = ''; // Initialize result as correct/incorrect

    try {
        // Check if the submitted answer is correct
        // if (submittedAnswer === sessionDataStore[sessionId]['correctAnswer']) {
        if (submittedAnswer === correctAnswer) {
            result = 'correct';
            // sessionDataStore[sessionId]['correct']++; // Increment correct answer count
            await incrementColumn(sessionId,'correct');
        } else {
            result = 'false';
            // sessionDataStore[sessionId]['incorrect']++; // Increment incorrect answer count
            await incrementColumn(sessionId,'incorrect');

            
            // sessionDataStore[sessionId]['missedWordsList'].push(`${sessionDataStore[sessionId]['currentWord']} (${sessionDataStore[sessionId]['correctAnswer']})`); // Add missed word to list
            await dbo.collection("sessions").updateOne(
                { sessionId: sessionId }, 
                { $push: { missedWordsList: `${currentWord} (${correctAnswer})` } },
                { upsert: true } // Create document if it doesn't exist
            );
        }
    

        // Render the result page
        // res.render('submit', { questionNumber: sessionDataStore[sessionId]['questionNumber'], correctAnswer: sessionDataStore[sessionId]['correctAnswer'], result: result });
        res.render('submit', { questionNumber, correctAnswer: correctAnswer, result: result });

        // sessionDataStore[sessionId]['currentIndex']++;
        incrementColumn(sessionId,'currentIndex'); // Move to the next question
    } catch (error) {
        console.error('Error processing submission:', error);
        res.status(500).send('Internal Server Error'); // Error handling
    }
});


app.post('/reset', async (req, res) => {
    const sessionId = req.session.session_id;
    
    //Ensure reset logic handles various session-related data removals
    if (sessionId) {
        // resetQuizState(sessionId)
        resetQuizStateDb(sessionId);
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