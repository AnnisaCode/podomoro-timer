// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    options: document.getElementById('options-screen'),
    timer: document.getElementById('timer-screen'),
    complete: document.getElementById('complete-screen')
};

// Buttons
const startBtn = document.getElementById('start-btn');
const startTimerBtn = document.getElementById('start-timer-btn');
const backToStartBtn = document.getElementById('back-to-start-btn');
const pauseTimerBtn = document.getElementById('pause-timer-btn');
const stopTimerBtn = document.getElementById('stop-timer-btn');
const snoozeBtn = document.getElementById('snooze-btn');
const completeStopBtn = document.getElementById('complete-stop-btn');

// Options
const sessionOptions = document.querySelectorAll('.session-option');
const breakCheckbox = document.getElementById('break-checkbox');

// Timer Elements
const timerTitle = document.getElementById('timer-title');
const currentSessionEl = document.getElementById('current-session');
const totalSessionsEl = document.getElementById('total-sessions');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const timerProgress = document.getElementById('timer-progress');
const timerCharacter = document.getElementById('timer-character');
const completeCharacter = document.getElementById('complete-character');
const completeMessage = document.getElementById('complete-message');

// Audio
const workCompleteSound = document.getElementById('work-complete-sound');
const breakCompleteSound = document.getElementById('break-complete-sound');

// Timer State
let timerState = {
    selectedSessions: 1,
    includeBreaks: true,
    currentSession: 1,
    isBreak: false,
    isRunning: false,
    isPaused: false,
    workDuration: 20 * 60, // 20 minutes in seconds
    breakDuration: 5 * 60, // 5 minutes in seconds
    timeRemaining: 20 * 60,
    timerInterval: null
};

// Helper Functions
function showScreen(screenId) {
    // Hide all screens
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });

    // Show the requested screen
    screens[screenId].classList.add('active');
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return { minutes: mins, seconds: secs };
}

function updateTimerDisplay() {
    const { minutes, seconds } = formatTime(timerState.timeRemaining);
    minutesEl.textContent = minutes;
    secondsEl.textContent = seconds;

    // Update progress circle
    const totalTime = timerState.isBreak ? timerState.breakDuration : timerState.workDuration;
    const progress = (1 - timerState.timeRemaining / totalTime) * 100;
    timerProgress.style.background = `conic-gradient(var(--primary-color) ${progress}%, transparent ${progress}%)`;
}

function startTimer() {
    timerState.isRunning = true;
    timerState.isPaused = false;
    pauseTimerBtn.textContent = 'Pause';

    clearInterval(timerState.timerInterval);
    timerState.timerInterval = setInterval(() => {
        if (timerState.timeRemaining <= 0) {
            handleTimerComplete();
        } else {
            timerState.timeRemaining -= 1;
            updateTimerDisplay();
        }
    }, 1000);
}

function pauseTimer() {
    if (timerState.isPaused) {
        startTimer();
    } else {
        timerState.isRunning = false;
        timerState.isPaused = true;
        pauseTimerBtn.textContent = 'Resume';
        clearInterval(timerState.timerInterval);
    }
}

function stopTimer() {
    timerState.isRunning = false;
    timerState.isPaused = false;
    clearInterval(timerState.timerInterval);
    showScreen('start');
}

function handleTimerComplete() {
    clearInterval(timerState.timerInterval);
    timerState.isRunning = false;

    if (timerState.isBreak) {
        // Break is complete
        breakCompleteSound.play();
        timerState.isBreak = false;

        // Move to next work session or complete if all sessions done
        if (timerState.currentSession > timerState.selectedSessions) {
            completeAllSessions();
        } else {
            completeMessage.textContent = 'Break Complete! Ready to work?';
            screens.complete.classList.add('break-complete');
            showScreen('complete');
        }
    } else {
        // Work session is complete
        workCompleteSound.play();

        if (timerState.includeBreaks && timerState.currentSession < timerState.selectedSessions) {
            // Start a break
            timerState.isBreak = true;
            completeMessage.textContent = 'Work Complete! Time for a break!';
            screens.complete.classList.remove('break-complete');
            showScreen('complete');
        } else {
            // No break needed (last session or breaks disabled)
            timerState.currentSession++;

            if (timerState.currentSession > timerState.selectedSessions) {
                completeAllSessions();
            } else {
                completeMessage.textContent = 'Session Complete! Ready for next session?';
                screens.complete.classList.remove('break-complete');
                showScreen('complete');
            }
        }
    }
}

function completeAllSessions() {
    completeMessage.textContent = 'All sessions complete! Great job!';
    screens.complete.classList.remove('break-complete');
    showScreen('complete');
}

function setupNextTimer() {
    if (timerState.isBreak) {
        // Setup break timer
        timerTitle.textContent = 'Break Time';
        timerState.timeRemaining = timerState.breakDuration;
        screens.timer.classList.add('break-mode');
    } else {
        // Setup work timer
        timerTitle.textContent = 'Work Time';
        timerState.timeRemaining = timerState.workDuration;
        screens.timer.classList.remove('break-mode');
    }

    // Update session counter
    currentSessionEl.textContent = timerState.currentSession;
    totalSessionsEl.textContent = timerState.selectedSessions;

    updateTimerDisplay();
    showScreen('timer');
    startTimer();
}

// Event Listeners
startBtn.addEventListener('click', () => {
    showScreen('options');
});

sessionOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Remove selected class from all options
        sessionOptions.forEach(opt => opt.classList.remove('selected'));

        // Add selected class to clicked option
        option.classList.add('selected');

        // Update state
        timerState.selectedSessions = parseInt(option.dataset.sessions);
    });
});

startTimerBtn.addEventListener('click', () => {
    // Get selected options
    timerState.includeBreaks = breakCheckbox.checked;

    // Reset session counter
    timerState.currentSession = 1;
    timerState.isBreak = false;

    // Setup the timer
    setupNextTimer();
});

backToStartBtn.addEventListener('click', () => {
    showScreen('start');
});

pauseTimerBtn.addEventListener('click', () => {
    pauseTimer();
});

stopTimerBtn.addEventListener('click', () => {
    stopTimer();
});

completeStopBtn.addEventListener('click', () => {
    if (timerState.currentSession > timerState.selectedSessions) {
        // All sessions complete, go back to start
        stopTimer();
    } else {
        // Continue with next timer (work or break)
        setupNextTimer();
    }
});

snoozeBtn.addEventListener('click', () => {
    // Snooze for 5 minutes
    timerState.timeRemaining = 5 * 60;
    timerState.isBreak = true;
    setupNextTimer();
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Select first session option by default
    sessionOptions[0].classList.add('selected');

    // Preselect 1 session
    timerState.selectedSessions = 1;
});