
# jp-quiz
Japanese Vocabulary Quiz Program

This program is designed to help you practice and test your knowledge of Japanese vocabulary. Originally a Command Line Interface (CLI) application, it has now evolved into a web-based application. You can still run the original CLI version, but the web version offers an enhanced user experience with a graphical interface.

## Features:

- **Multiple Platform Support**: Now available as both a CLI program and a web app.
- **Vocabulary Management**: Reads Japanese vocabulary from JSON files stored in the `vocab/json` directory.
- **Lesson Selection**: Choose specific lessons to study, each containing its own set of vocabulary.
- **Randomized Questions**: The order of words is randomized for a varied quiz experience.
- **Multiple-Choice Questions**: Each word is presented with multiple-choice answers.
- **Progress Tracking**: Tracks correct and incorrect answers, and provides a summary at the end of the quiz.
- **Missed Words List**: Displays a list of words you answered incorrectly for further review.

## Web Version

### Getting Started:

1. **Installation**: 
   Ensure you have [Node.js](https://nodejs.org/) installed on your machine. 

   Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/yourusername/jp-quiz.git
   cd jp-quiz
   npm install
   ```

2. **Node Package Dependencies**:
   The web version requires the following packages, which are installed via `npm install`:
   - `express`: Web framework for Node.js.
   - `ejs`: Embedded JavaScript templating.

3. **Running the Web App**:
   Start the server:
   ```bash
   node app.js
   ```
   Open your web browser and go to [http://localhost:3000](http://localhost:3000).

4. **Using the Web App**:
   - **Home Page**: The home page welcomes you and allows you to start the quiz.
   - **Lesson Selection**: Select a lesson from the available list.
   - **Quiz Interface**: Answer the multiple-choice questions displayed.
   - **Review Summary**: At the end of the quiz, view your score and any missed words.

## CLI Version

### Usage:

1. **Prepare Vocabulary Files**:
   Create JSON files in the `vocab/json` directory. Each file should contain a Japanese word list and their English translations.

   Example `lesson-1-vocab.json`:
   ```json
   {
       "translations": {
           "こんにちは": "hello",
           "ありがとう": "thank you",
           "さようなら": "goodbye"
       }
   }
   ```

2. **Run the Program**:
   Execute the CLI version by running the JavaScript file using Node.js:
   ```bash
   node quiz.js
   ```

3. **Take the Quiz**:
   Follow the prompts in the terminal to select a lesson and answer the quiz questions.

4. **Review Results**:
   After completing the quiz, the CLI program will display your score and any missed words.

### Dependencies:

- Node.js (JavaScript runtime environment)
- Express.js and EJS (for the web version)

### Notes:

- Ensure that Node.js is installed on your system before running the program.
- The vocabulary files should be placed in the `vocab/json` directory.
- Customize the number of quiz questions by adjusting the `testLength` variable in the code.
