const express = require('express');
const { generateLessonBankObject, generateVocabBankObject, generateQuizQuestionsObject, currentIndex } = require('./quiz-web');
const path = require('path');
const app = express();
const port = 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define the home route
app.get('/', (req, res) => {
    res.render('index');
});

// Define the JSON route
app.get('/selectlesson', (req, res) => {
    let lessonBank = generateLessonBankObject();
    res.render('selectLesson', { jsonData: lessonBank });
});

app.post('/quiz/:lessonFile', async (req, res) => {
    const lessonChoice = req.params.lessonFile;;
    try {
        const vocabBankObject = await generateVocabBankObject(lessonChoice);
        //unpack some values from the vocab bank object
        let quizQuestionsObject = await generateQuizQuestionsObject(vocabBankObject);
        let questionNumber = currentIndex + 1;
        let currentQuizQuestion = quizQuestionsObject[questionNumber];
        let currentWord = Object.keys(currentQuizQuestion)[0]
        let choices = quizQuestionsObject[questionNumber][currentWord];

        res.render('displayWord', { jsonData: choices, word : currentWord });
    } catch (error) {
        console.error('Error generating vocab object:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/quiz/{lesson}', (req, res) => {
    let lessonBank = generateLessonBankObject();
    console.log(lessonBank)
    res.render('selectLesson', { jsonData: lessonBank });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
