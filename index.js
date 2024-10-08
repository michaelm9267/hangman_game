// Select DOM elements
const man = document.querySelector('.man');
const head = document.querySelector('.head');
const body = document.querySelector('.body');
const leftArm = document.querySelector('.left-arm');
const rightArm = document.querySelector('.right-arm');
const leftLeg = document.querySelector('.left-leg');
const rightLeg = document.querySelector('.right-leg');
const guessInput = document.querySelector('.letter-input');
const wordDisplay = document.querySelector('.word');
const wrongLettersDisplay = document.querySelector('.letters');
const categoryDisplay = document.querySelector('.category');
const resetButton = document.getElementById('reset-button');
const moduleWord = document.querySelector('.module-word');
const overlay = document.getElementById('game-over-overlay');
const playAgainButton = document.getElementById('play-again-button');

// Game variables
let selectedWord;
let wordArr;
let guessArr = [];
let wrongGuess = 0;
let correctGuess = 0;
let totalLetters;

// Function to initialize the game
function initializeGame() {
    // Reset variables
    wrongGuess = 0;
    correctGuess = 0;
    guessArr = [];
    wrongLettersDisplay.textContent = '';
    wordDisplay.innerHTML = '';

    // Hide all hangman parts
    [head, body, leftArm, rightArm, leftLeg, rightLeg].forEach(part => {
        part.classList.remove('visible');
        part.setAttribute('hidden', true); // Ensure they're hidden via attribute
    });

    // Hide overlay
    overlay.classList.remove('active');

    // Enable the input field
    guessInput.disabled = false;

    // Fetch the words from the JSON file
    fetch('./words.json')
        .then(response => response.json())
        .then(words => {
            // Select a random word object (word and category)
            let randomWordObj = words[Math.floor(Math.random() * words.length)];
            console.log('Selected Word Object:', randomWordObj);
            
            selectedWord = randomWordObj.word.toLowerCase();  // Get the word
            wordArr = selectedWord.split('');  // Split word into an array of characters
            console.log('Word Array:', wordArr);
            
            // Display category
            categoryDisplay.textContent = `Category: ${randomWordObj.category}`;
            
            // Initialize the guess array: underscores for letters, spaces for spaces
            guessArr = wordArr.map(char => (char === ' ' ? ' ' : '_'));
            console.log("Initial guessArr:", guessArr);
            
            // Create span elements for each character
            wordDisplay.innerHTML = guessArr.map(char => {
                if (char === ' ') {
                    return '<span class="space"> </span>';
                } else {
                    return `<span class="letter">${char}</span>`;
                }
            }).join(' ');
            
            // Calculate total letters for win condition
            totalLetters = wordArr.filter(char => char !== ' ').length;
        })
        .catch(error => console.error('Error loading words:', error));
}

// Call initializeGame on page load
initializeGame();

// Function to reveal hangman parts based on wrong guesses
function revealHangman(wrongGuessCount) {
    switch (wrongGuessCount) {
        case 1:
            head.classList.add('visible');
            head.removeAttribute('hidden');
            break;
        case 2:
            body.classList.add('visible');
            body.removeAttribute('hidden');
            break;
        case 3:
            leftArm.classList.add('visible');
            leftArm.removeAttribute('hidden');
            break;
        case 4:
            rightArm.classList.add('visible');
            rightArm.removeAttribute('hidden');
            break;
        case 5:
            leftLeg.classList.add('visible');
            leftLeg.removeAttribute('hidden');
            break;
        case 6:
            rightLeg.classList.add('visible');
            rightLeg.removeAttribute('hidden');
            showResult(false); // Player loses
            break;
        default:
            break;
    }
}

// Function to display the Result overlay (Win or Game Over)
function showResult(isWin) {
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = overlay.querySelector('h4');
    const moduleWord = document.querySelector('.module-word');

    if (isWin) {
        modalTitle.textContent = 'Congratulations! You Win!';
        modalSubtitle.textContent = 'The word was:';
    } else {
        modalTitle.textContent = 'Game Over';
        modalSubtitle.textContent = 'The word or phrase was:';
    }

    moduleWord.textContent = selectedWord;
    overlay.classList.add('active');
    guessInput.disabled = true;
}

// Event listener for guessing letters or words
guessInput.addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {  // Trigger on 'Enter' key
        let input = e.target.value.toLowerCase().trim();  // Get and sanitize input

        // Clear the input field
        e.target.value = '';

        // Check if input is empty
        if (input === '') {
            alert('Please enter a letter or guess the entire word/phrase.');
            return;
        }

        // Determine if the input is a single letter or a whole word/phrase
        if (input.length === 1) {
            // **Single Letter Guess**

            let letter = input;

            // Validate input: single alphabetical character
            if (!/^[a-z]$/.test(letter)) {
                alert('Please enter a single letter (a-z).');
                return;
            }

            // Check if letter has already been guessed
            if (wrongLettersDisplay.textContent.includes(letter) || Array.from(wordDisplay.children).some(span => span.textContent === letter)) {
                alert('You have already guessed that letter.');
                return;
            }

            let letterFound = false;

            for (let i = 0; i < wordArr.length; i++) {
                if (wordArr[i] === letter) {
                    if (guessArr[i] !== letter) { // Prevent double counting
                        guessArr[i] = letter;
                        correctGuess++;
                        letterFound = true;
                        // Update the span element
                        wordDisplay.children[i].textContent = letter;
                        wordDisplay.children[i].classList.add('correct'); // Optional: Add class for styling
                    }
                }
            }

            if (letterFound) {
                // Check win condition
                if (correctGuess === totalLetters) {
                    // Remove the alert and show the winning module
                    // alert('Congratulations! You Win!');
                    showResult(true); // Player wins
                }
            } else {
                // Handle wrong guess
                wrongGuess++;
                wrongLettersDisplay.textContent += letter + ' ';

                // Reveal hangman part
                revealHangman(wrongGuess);
            }
        } else {
            // **Whole Word/Phrase Guess**

            let wordGuess = input;

            // Validate input: only letters and spaces
            if (!/^[a-z\s]+$/.test(wordGuess)) {
                alert('Please enter only letters and spaces for a word/phrase guess.');
                return;
            }

            // Compare the guess with the selected word
            if (wordGuess === selectedWord) {
                // Correct guess
                // Reveal all letters
                for (let i = 0; i < wordArr.length; i++) {
                    if (wordArr[i] !== ' ') {
                        guessArr[i] = wordArr[i];
                        wordDisplay.children[i].textContent = wordArr[i];
                        wordDisplay.children[i].classList.add('correct'); // Optional: Add class for styling
                    }
                }
                // Remove the alert and show the winning module
                // alert('Congratulations! You Win!');
                showResult(true); // Player wins
            } else {
                // Incorrect guess
                wrongGuess++;
                // Do NOT add to wrongLettersDisplay
                // Just reveal a hangman part
                revealHangman(wrongGuess);
            }
        }
    }
});

// Event listener for Play Again button in the modal
playAgainButton.addEventListener('click', function () {
    initializeGame();
});

// Event listener for Reset button
resetButton.addEventListener('click', function () {
    initializeGame();
});
