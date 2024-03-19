# jp-quiz
Japanese Vocabulary Quiz Program

This program is designed to help you practice and test your knowledge of Japanese vocabulary. It reads a list of Japanese words and their English translations from a file named vocabulary.txt, then prompts you to translate Japanese words into English.
Features:

    Reads Japanese vocabulary from a text file.
    Randomizes the order of words for a varied quiz experience.
    Provides multiple-choice questions for each word.
    Tracks correct and incorrect answers.
    Allows continuous quizzing until all words are exhausted.

Usage:

    Prepare Vocabulary File:

    Create a text file named vocabulary.txt containing Japanese words and their English translations. Each line should consist of a Japanese word followed by a comma and its corresponding English translation.

    Example vocabulary.txt:

こんにちは,hello
ありがとう,thank you
さようなら,goodbye

Run the Program:

Execute the program by running the JavaScript file using Node.js. For example:

bash

    node quiz.js

    Take the Quiz:

    Follow the prompts to translate each Japanese word into English. Choose the correct answer from the provided multiple-choice options.

    Review Results:

    After completing the quiz, the program will display the number of correct and incorrect answers.

    Repeat (Optional):

    If desired, you can run the program again to continue practicing or test your knowledge with a new quiz.

Dependencies:

    Node.js (JavaScript runtime environment)

Notes:

    Ensure that Node.js is installed on your system before running the program.
    The program expects the vocabulary file (vocabulary.txt) to be in the same directory.
    You can customize the number of words to quiz by adjusting the value of currentIndex < 20 in the code.

