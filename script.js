const quizContainer = document.getElementById('quiz');
const submitButton = document.getElementById('submit');
const scorePopup = document.getElementById('score-popup');
const quizScoreDisplay = document.getElementById('quiz-score');
const timerDisplay = document.getElementById('timer');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
let currentPageIndex = 0;
let score = 0;
const questionsPerPage = 5;
const totalQuizTimeInSeconds = 4 * 60; // 4 minutes for all 4 pages
let quizTimerInterval;
let selectedAnswers = [];
let questions = [];

async function fetchQuizData() {
    const response = await fetch('questions.json');
    questions = await response.json();
    selectedAnswers = new Array(questions.length).fill(null); // Array to store selected answers
    startQuiz();
}

function startQuiz() {
    showQuestionsForCurrentPage();
    startQuizTimer();
}

function showQuestionsForCurrentPage() {
    const startIndex = currentPageIndex * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const pageQuestions = questions.slice(startIndex, endIndex);
    quizContainer.innerHTML = '';
    pageQuestions.forEach((questionData, index) => {
        const questionIndex = startIndex + index;
        quizContainer.innerHTML += `
            <div class="question">
                <h2>${questionIndex + 1}. ${questionData.question}</h2>
                ${questionData.options.map(option => `
                    <label>
                        <input type="radio" name="answer-${questionIndex}" value="${option}" ${selectedAnswers[questionIndex] === option ? 'checked' : ''}>
                        ${option}
                    </label>
                `).join('')}
            </div>
        `;
    });
    updateNavigationButtons();
}

function startQuizTimer() {
    updateTimerDisplay(totalQuizTimeInSeconds);
    let currentTimeInSeconds = totalQuizTimeInSeconds;
    quizTimerInterval = setInterval(() => {
        currentTimeInSeconds--;
        updateTimerDisplay(currentTimeInSeconds);
        if (currentTimeInSeconds <= 0) {
            clearInterval(quizTimerInterval);
            finishQuiz();
        }
    }, 1000);
}

function updateTimerDisplay(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    timerDisplay.textContent = `Time Left: ${minutes}:${formattedSeconds}`;
}

function finishQuiz() {
    calculateFinalScore();
    showScorePopup();
}

function calculateFinalScore() {
    score = 0; // Reset score before calculating
    questions.forEach((questionData, index) => {
        const answer = selectedAnswers[index];
        if (answer === questionData.correctAnswer) {
            score++;
        }
    });
}

function showScorePopup() {
    quizScoreDisplay.textContent = score;
    scorePopup.style.display = 'block';
}

function updateNavigationButtons() {
    if (currentPageIndex === 0) {
        prevPageButton.style.display = 'none'; // Hide previous button on first page
    } else {
        prevPageButton.style.display = 'inline-block'; // Show previous button on other pages
    }

    if (currentPageIndex === Math.ceil(questions.length / questionsPerPage) - 1) {
        submitButton.style.display = 'inline-block';
        nextPageButton.style.display = 'none';
    } else {
        submitButton.style.display = 'none';
        nextPageButton.style.display = 'inline-block';
    }
}

prevPageButton.addEventListener('click', () => {
    goToPreviousPage();
});

nextPageButton.addEventListener('click', () => {
    goToNextPage();
});

submitButton.addEventListener('click', () => {
    clearInterval(quizTimerInterval); // Stop the quiz timer
    finishQuiz();
    nextPageButton.style.display = 'none'; // Hide next page button after submitting
});

// Event listener for storing selected answers
quizContainer.addEventListener('change', event => {
    const target = event.target;
    if (target.type === 'radio') {
        const questionIndex = parseInt(target.name.split('-')[1], 10);
        selectedAnswers[questionIndex] = target.value;
    }
});

function goToPreviousPage() {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        showQuestionsForCurrentPage();
        resetQuizTimer();
    }
}

function goToNextPage() {
    if (currentPageIndex < Math.ceil(questions.length / questionsPerPage) - 1) {
        currentPageIndex++;
        showQuestionsForCurrentPage();
        resetQuizTimer();
    }
}

window.addEventListener('load', fetchQuizData);
