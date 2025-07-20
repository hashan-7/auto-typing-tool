const inputText = document.getElementById('inputText');
const outputArea = document.getElementById('outputArea');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const playButton = document.getElementById('playButton');
const speedControl = document.getElementById('speedControl');
const fullscreenButton = document.getElementById('fullscreenButton');
const themeSelector = document.getElementById('themeSelector');
const copyButton = document.getElementById('copyButton');
const clearInputButton = document.getElementById('clearInputButton');
const clearOutputButton = document.getElementById('clearOutputButton');
const fileInput = document.getElementById('fileInput'); // ALUTH: File input reference
const bodyElement = document.body;

// --- Thathwaya mathaka thiyaganna Variables ---
let typingTimer;
let charIndex = 0;
let currentText = ''; // Me variable eka type wena text eka thiyagannawa
let isPaused = false;
let typingSpeed = parseInt(speedControl.value, 10);
const themeClasses = ['theme-light', 'theme-notepad', 'theme-sublime', 'theme-vscode-dark'];
const cursorElementId = 'typingCursor';
let currentLineNumber = 1;
const localStorageKey = 'autoTyperInputText';

// --- Mulika Typing Function eka ---
function typeCharacter() {
    if (isPaused) return;

    const existingCursor = document.getElementById(cursorElementId);
    if (existingCursor) {
        existingCursor.remove();
    }

    if (charIndex < currentText.length) {
        const char = currentText[charIndex];

        if (char === '\n') {
            outputArea.appendChild(document.createTextNode('\n'));
            currentLineNumber++;
            const lineNumberSpan = document.createElement('span');
            lineNumberSpan.className = 'line-number';
            lineNumberSpan.textContent = `${currentLineNumber} `;
            lineNumberSpan.setAttribute('aria-hidden', 'true');
            outputArea.appendChild(lineNumberSpan);
        } else {
            outputArea.appendChild(document.createTextNode(char));
        }

        charIndex++;

        const cursorSpan = document.createElement('span');
        cursorSpan.id = cursorElementId;
        cursorSpan.textContent = '|';
        cursorSpan.setAttribute('aria-hidden', 'true');
        outputArea.appendChild(cursorSpan);

        outputArea.scrollTop = outputArea.scrollHeight;
        typingTimer = setTimeout(typeCharacter, typingSpeed);
    } else {
        finishTyping();
    }
}

// --- Typing iwara unama UI wenas kam walata function eka ---
function finishTyping() {
    const existingCursor = document.getElementById(cursorElementId);
    if (existingCursor) {
        existingCursor.remove();
    }
    pauseButton.style.display = 'none';
    playButton.style.display = 'none';
    startButton.disabled = false;
    startButton.textContent = 'Start Typing';
    copyButton.disabled = !inputText.value; // Enable copy based on input text
    clearTimeout(typingTimer);
}

// --- Start Button ekata Event Listener ---
startButton.addEventListener('click', () => {
    // Start karanna ganna text eka denata input eke thiyena eka
    currentText = inputText.value;
    if (currentText.length > 0) {
        startTypingProcess();
    } else {
        outputArea.textContent = 'Please paste some text into the input area first.';
        copyButton.disabled = true;
    }
});

// --- Typing process eka patan ganna function eka ---
function startTypingProcess() {
    outputArea.innerHTML = '';
    charIndex = 0;
    isPaused = false;
    currentLineNumber = 1;
    typingSpeed = parseInt(speedControl.value, 10);

    const initialLineNumberSpan = document.createElement('span');
    initialLineNumberSpan.className = 'line-number';
    initialLineNumberSpan.textContent = `${currentLineNumber} `;
    initialLineNumberSpan.setAttribute('aria-hidden', 'true');
    outputArea.appendChild(initialLineNumberSpan);

    startButton.disabled = true;
    startButton.textContent = 'Typing...';
    pauseButton.style.display = 'inline-block';
    playButton.style.display = 'none';
    copyButton.disabled = true;

    clearTimeout(typingTimer);
    typeCharacter();
}

// --- Pause Button ekata Event Listener ---
pauseButton.addEventListener('click', pauseTyping);

// --- Pause kirime function eka ---
function pauseTyping() {
     if (!isPaused && startButton.disabled) {
        isPaused = true;
        clearTimeout(typingTimer);
        pauseButton.style.display = 'none';
        playButton.style.display = 'inline-block';
        startButton.textContent = 'Start Typing';
        copyButton.disabled = !inputText.value; // Enable copy based on input text
    }
}

// --- Play/Resume Button ekata Event Listener ---
playButton.addEventListener('click', resumeTyping);

// --- Resume kirime function eka ---
function resumeTyping() {
    if (isPaused && startButton.disabled) {
        isPaused = false;
        playButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
        startButton.textContent = 'Typing...';
        copyButton.disabled = true;
        typeCharacter();
    }
}

// --- Copy Button ekata Event Listener ---
copyButton.addEventListener('click', () => {
    const textToCopy = inputText.value; // Denata input eke thiyena eka copy karanna

    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                copyButton.classList.remove('btn-info');
                copyButton.classList.add('btn-success');
                setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.classList.remove('btn-success');
                    copyButton.classList.add('btn-info');
                }, 1500);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Error!';
                copyButton.classList.remove('btn-info');
                copyButton.classList.add('btn-danger');
                setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.classList.remove('btn-danger');
                    copyButton.classList.add('btn-info');
                }, 2000);
            });
    } else {
        console.warn('Nothing to copy.');
        copyButton.disabled = true;
    }
});

// --- Clear Input Button ekata Event Listener ---
clearInputButton.addEventListener('click', () => {
    inputText.value = '';
    localStorage.removeItem(localStorageKey);
    copyButton.disabled = true; // Input clear karama copy karanna be
    console.log('Input cleared and removed from Local Storage.');
});

// --- Clear Output Button ekata Event Listener ---
clearOutputButton.addEventListener('click', () => {
    clearTimeout(typingTimer);
    isPaused = false;
    outputArea.innerHTML = '';
    charIndex = 0;
    currentLineNumber = 1;
    startButton.disabled = false;
    startButton.textContent = 'Start Typing';
    pauseButton.style.display = 'none';
    playButton.style.display = 'none';
    copyButton.disabled = !inputText.value; // Enable/disable based on input
});

// --- Input Text Area ekata Event Listener (Local Storage sadaha) ---
inputText.addEventListener('input', () => {
    // Input eke text eka wenas wena hama welema Local Storage eke save karanna
    const currentInputValue = inputText.value;
    try {
        localStorage.setItem(localStorageKey, currentInputValue);
    } catch (e) {
        console.error("Failed to save to Local Storage:", e);
    }
    // Input eka his nethnam copy button enable karanna
    copyButton.disabled = !currentInputValue;
});

// --- ALUTH: File Input ekata Event Listener ---
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0]; // Thoragath file eka

    if (file) {
        const reader = new FileReader(); // FileReader object ekak hadanna

        // File eka kiyawala iwara unama wena de define karanna
        reader.onload = (e) => {
            const fileContent = e.target.result; // File eke content eka
            inputText.value = fileContent; // Input area ekata danna

            // Local storage eke save karanna
            try {
                localStorage.setItem(localStorageKey, fileContent);
            } catch (err) {
                console.error("Failed to save file content to Local Storage:", err);
            }

            // Copy button eka enable karanna
            copyButton.disabled = false;

            console.log('File loaded successfully.');
            // Optional: File eka load karapu gaman auto-start karanna
            // currentText = fileContent;
            // startTypingProcess();
        };

        // File eka kiyawaddi error ekak awoth
        reader.onerror = (e) => {
            console.error("Error reading file:", e);
            alert("Error reading file. Please try again."); // User ta danwanna
        };

        // File eka text widiyata kiyawanna patan ganna
        reader.readAsText(file);
    }

    // File input value eka clear karanna, ethakota ekama file eka ayeth thoranna puluwan
    event.target.value = null;
});


// --- Speed Control ekata Event Listener ---
speedControl.addEventListener('change', (event) => {
    typingSpeed = parseInt(event.target.value, 10);
});

// --- Fullscreen Button ekata Event Listener ---
fullscreenButton.addEventListener('click', toggleFullscreen);

// --- Keyboard Event Listener (ESC saha Space) ---
document.addEventListener('keydown', (event) => {
    if (document.activeElement === inputText) { return; } // Input eke focus eka nam ignore karanna

    if (bodyElement.classList.contains('fullscreen-active')) {
        if (event.key === 'Escape') {
            exitFullscreen();
        } else if (event.key === ' ' || event.code === 'Space') {
             if (startButton.disabled) {
                event.preventDefault();
                if (isPaused) { resumeTyping(); } else { pauseTyping(); }
             }
        }
    }
});

// --- Theme Selector Event Listener ---
themeSelector.addEventListener('change', (event) => {
    applyTheme(event.target.value);
});

// --- Thoragath theme eka apply karana function eka ---
function applyTheme(themeValue) {
    outputArea.classList.remove(...themeClasses);
    if (themeValue === 'light') { outputArea.classList.add('theme-light'); }
    else if (themeValue === 'notepad') { outputArea.classList.add('theme-notepad'); }
    else if (themeValue === 'sublime') { outputArea.classList.add('theme-sublime'); }
    else if (themeValue === 'vscode-dark') { outputArea.classList.add('theme-vscode-dark'); }
    updateFullscreenBackground(themeValue);
}

// --- Fullscreen body background eka update karana function eka ---
function updateFullscreenBackground(themeValue) {
    let bgColor;
    switch (themeValue) {
        case 'light': bgColor = 'var(--editor-bg-light)'; break;
        case 'notepad': bgColor = 'var(--editor-bg-notepad)'; break;
        case 'sublime': bgColor = 'var(--editor-bg-sublime)'; break;
        case 'vscode-dark': bgColor = 'var(--editor-bg-vscode-dark)'; break;
        default: bgColor = 'var(--editor-bg-dark)'; break;
    }
    if (bodyElement.classList.contains('fullscreen-active')) {
         bodyElement.style.backgroundColor = bgColor;
    }
    bodyElement.dataset.fullscreenBg = bgColor;
}

// --- Fullscreen ekata yana/ena function eka ---
function toggleFullscreen() {
    if (bodyElement.classList.contains('fullscreen-active')) { exitFullscreen(); }
    else { enterFullscreen(); }
}

// --- Fullscreen ekata yana function eka ---
function enterFullscreen() {
    bodyElement.classList.add('fullscreen-active');
    fullscreenButton.textContent = 'Exit Fullscreen';
    fullscreenButton.setAttribute('aria-label', 'Exit Fullscreen Mode');
    bodyElement.style.backgroundColor = bodyElement.dataset.fullscreenBg || 'var(--editor-bg-dark)';
    outputArea.scrollTop = outputArea.scrollHeight;
}

// --- Fullscreen eken exit wena function eka ---
function exitFullscreen() {
    bodyElement.classList.remove('fullscreen-active');
    fullscreenButton.textContent = 'Fullscreen';
    fullscreenButton.setAttribute('aria-label', 'Enter Fullscreen Mode');
    bodyElement.style.backgroundColor = '';
}

// --- Arambhika UI Thathwaya ---
function initializeUI() {
    const savedText = localStorage.getItem(localStorageKey);
    if (savedText) { inputText.value = savedText; }

    startButton.disabled = false;
    pauseButton.style.display = 'none';
    playButton.style.display = 'none';
    outputArea.innerHTML = '';
    copyButton.disabled = !inputText.value; // Enable/disable based on initial input
    exitFullscreen();
    applyTheme(themeSelector.value);
}

// DOM eka sampurnayen load unama initialization function eka call karanna
document.addEventListener('DOMContentLoaded', initializeUI);
