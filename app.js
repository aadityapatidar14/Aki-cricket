// ============================================================================
// Aki-Cricket: IPL Cricket-themed AI Akinator - Core Logic & AI Integration
// ============================================================================

const API_KEY = "AIzaSyAkdOe8TQTn4EjfVGpKOFRKNzN4zA7GIZ4";

import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Game State Variables ---
let gameHistory = [];
let currentQuestion = "";
let turnCount = 1;
const MAX_TURNS = 15;
let isGameOver = false;
let apiKeyInUse = "";

// Dynamic Loader Sarcastic Messages
const LOADING_MESSAGES = [
  "Aki is checking the DRS ball tracking...",
  "Consulting the third umpire and reviewing front-foot no-balls...",
  "Polishing the leather ball for some extra swing in the questions...",
  "Field settings adjusted. Aki is coming in from the Pavilion End...",
  "Analyzing previous IPL seasons to match your brainwaves...",
  "Checking with stats gurus in the commentary box...",
  "Applying the Duckworth-Lewis-Stern method to your answers..."
];
let loaderInterval = null;

// --- DOM Elements ---
const screens = {
  start: document.getElementById("start-screen"),
  loading: document.getElementById("loading-screen"),
  game: document.getElementById("game-screen"),
  guess: document.getElementById("guess-screen"),
  end: document.getElementById("end-screen")
};

const el = {
  startButton: document.getElementById("start-game-btn"),
  loadingTitle: document.querySelector(".loading-title"),
  loadingCommentary: document.getElementById("loading-commentary-text"),
  turnCounter: document.getElementById("turn-counter"),
  activeQuestion: document.getElementById("active-question-text"),
  choiceButtons: document.querySelectorAll(".btn-choice"),
  liveCommentary: document.getElementById("live-commentary-text"),
  suspectedEntity: document.getElementById("suspected-entity-name"),
  guessCommentary: document.getElementById("guess-commentary-text"),
  guessYesBtn: document.getElementById("guess-yes-btn"),
  guessNoBtn: document.getElementById("guess-no-btn"),
  endEmoji: document.getElementById("end-emoji"),
  endHeader: document.getElementById("end-header"),
  endDescription: document.getElementById("end-description"),
  endTargetEntity: document.getElementById("end-target-entity"),
  endTotalTurns: document.getElementById("end-total-turns"),
  endCommentary: document.getElementById("end-commentary-text"),
  toggleHistoryBtn: document.getElementById("toggle-history-btn"),
  historyList: document.getElementById("history-list"),
  restartBtn: document.getElementById("restart-game-btn"),
  
  // API Key config elements
  toggleKeyBtn: document.getElementById("toggle-key-btn"),
  keyModal: document.getElementById("key-modal"),
  apiKeyInput: document.getElementById("api-key-input"),
  saveKeyBtn: document.getElementById("save-key-btn"),
  closeKeyBtn: document.getElementById("close-key-btn")
};

// --- Initialization & UI Binding ---
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  loadSavedAPIKey();
});

function setupEventListeners() {
  // Start game action
  el.startButton.addEventListener("click", handleStartGame);

  // Choice answers
  el.choiceButtons.forEach(button => {
    button.addEventListener("click", () => {
      const answer = button.getAttribute("data-answer");
      handleUserAnswer(answer);
    });
  });

  // Guess confirmation
  el.guessYesBtn.addEventListener("click", () => handleFinalDecision(true));
  el.guessNoBtn.addEventListener("click", () => handleFinalDecision(false));

  // Restart actions
  el.restartBtn.addEventListener("click", resetToStart);

  // Toggle match history accordion
  el.toggleHistoryBtn.addEventListener("click", toggleHistoryView);

  // API configuration modal controls
  el.toggleKeyBtn.addEventListener("click", () => el.keyModal.classList.toggle("hidden"));
  el.closeKeyBtn.addEventListener("click", () => el.keyModal.classList.add("hidden"));
  el.saveKeyBtn.addEventListener("click", saveCustomAPIKey);
}

// --- Screen State Transitions ---
function showScreen(screenKey) {
  Object.keys(screens).forEach(key => {
    if (key === screenKey) {
      screens[key].classList.remove("hidden");
    } else {
      screens[key].classList.add("hidden");
    }
  });
}

// --- API Key Management ---
function loadSavedAPIKey() {
  const localKey = localStorage.getItem("AKI_CRICKET_API_KEY");
  if (API_KEY && API_KEY !== "PASTE_YOUR_GEMINI_API_KEY_HERE") {
    apiKeyInUse = API_KEY;
    el.apiKeyInput.value = API_KEY;
  } else if (localKey) {
    apiKeyInUse = localKey;
    el.apiKeyInput.value = localKey;
  } else {
    // Prompt the user to enter API key if both are empty
    setTimeout(() => {
      el.keyModal.classList.remove("hidden");
    }, 800);
  }
}

function saveCustomAPIKey() {
  const enteredKey = el.apiKeyInput.value.trim();
  if (enteredKey) {
    localStorage.setItem("AKI_CRICKET_API_KEY", enteredKey);
    apiKeyInUse = enteredKey;
    el.keyModal.classList.add("hidden");
    alert("Gemini API Key saved successfully! Let's play ball!");
  } else {
    alert("Please enter a valid Gemini API Key.");
  }
}

// --- Dynamic Loader Commentary ---
function startLoaderCommentary() {
  let index = 0;
  // Instantly show the first message
  el.loadingCommentary.textContent = `"${LOADING_MESSAGES[index]}"`;
  
  loaderInterval = setInterval(() => {
    index = (index + 1) % LOADING_MESSAGES.length;
    el.loadingCommentary.textContent = `"${LOADING_MESSAGES[index]}"`;
  }, 3000);
}

function stopLoaderCommentary() {
  if (loaderInterval) {
    clearInterval(loaderInterval);
    loaderInterval = null;
  }
}

// --- Game Logic Flow ---
async function handleStartGame() {
  if (!apiKeyInUse) {
    el.keyModal.classList.remove("hidden");
    alert("Captain, we need a Gemini API Key to start the match! Tap the key icon at the top right.");
    return;
  }

  // Reset core game states
  gameHistory = [];
  turnCount = 1;
  isGameOver = false;
  el.historyList.classList.add("hidden");
  el.toggleHistoryBtn.textContent = "Show Match Statistics (DRS Review)";

  // Show loading screen and run commentary spinner
  showScreen("loading");
  startLoaderCommentary();

  // Ask first question from Gemini
  await getAkiResponse();
}

async function handleUserAnswer(answer) {
  // Store user's input to the gameHistory
  gameHistory.push({
    question: currentQuestion,
    answer: answer
  });

  turnCount++;

  // Transition to loader
  showScreen("loading");
  startLoaderCommentary();

  // Query AI for next state
  await getAkiResponse();
}

// --- AI Core SDK Connection ---
async function getAkiResponse() {
  try {
    const genAI = new GoogleGenerativeAI(apiKeyInUse);
    
    // We strictly use gemini-1.5-flash
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: `You are a genius, incredibly witty, and slightly sarcastic IPL cricket commentator acting as Akinator.
The user is thinking of either an IPL cricket player (past or present) or an IPL team franchise.
Your goal is to guess who/what they are thinking of in 15 questions or fewer.

You MUST strictly output a JSON object matching this exact layout:
{
  "is_ready_to_guess": boolean,
  "guess": "String player/team name or null",
  "next_question": "String Yes/No question or null",
  "commentary": "String witty, sarcastic commentator commentary"
}

Rules:
1. "is_ready_to_guess" must be set to true ONLY when you are highly confident you can guess the player or team name (typically after 8-15 questions, or earlier if you are absolutely certain).
2. If "is_ready_to_guess" is true, "guess" must contain the specific entity name (e.g. "Virat Kohli", "Chennai Super Kings", "Jasprit Bumrah") and "next_question" must be null.
3. If "is_ready_to_guess" is false, "next_question" must contain a brilliant Yes/No question to narrow down the entities, and "guess" must be null.
4. "commentary" must be a witty, sarcastic, and colorful cricket commentary sentence reflecting on the current progress, the user's answers, or your level of confidence. Use rich IPL/cricket jargon (e.g., 'bowled him!', 'free hit', 'super over', 'straight down the ground', 'Duckworth-Lewis', 'clean sweep'). Be wittily cheeky but not offensive.
5. Do NOT repeat any questions you have already asked. Review the match history carefully to formulate your next smart delivery.
6. Systematically divide the search space (e.g., start by figuring out if it's a team vs a player, foreign player vs Indian player, active vs retired, batsman vs bowler, etc.).`
    });

    // Construct prompt containing the match logs
    let prompt = `Analyze the user's answers and proceed with your game strategy.
Here is the official DRS Match History of this match so far:
`;

    if (gameHistory.length === 0) {
      prompt += `[No questions have been asked yet. This is the first delivery of the match! Ask a smart, broad opening question to get off the mark.]`;
    } else {
      gameHistory.forEach((item, index) => {
        prompt += `Delivery ${index + 1}: Question: "${item.question}" -> User answered: "${item.answer}"\n`;
      });
    }

    // Force guess if at maximum limits
    if (turnCount >= MAX_TURNS) {
      prompt += `\nCRITICAL: This is turn ${turnCount} of ${MAX_TURNS}. You have reached the limit! You MUST make a guess now. Set "is_ready_to_guess" to true and provide your absolute best guess in the "guess" field.`;
    } else {
      prompt += `\nThis is turn ${turnCount} out of ${MAX_TURNS}. Decide whether to ask a new question or make your final guess.`;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse response JSON safely
    const data = JSON.parse(responseText);
    
    // Process response states
    handleAkiResult(data);
  } catch (error) {
    console.error("DRS Error in getting Akinator response:", error);
    stopLoaderCommentary();
    
    // Graceful sports network error display
    showScreen("game");
    el.activeQuestion.innerHTML = `<span style="color: var(--color-danger)">🚨 System Bowled Out!</span>`;
    el.liveCommentary.textContent = `Aki got hit for a massive six and lost the ball! Error: ${error.message || "Invalid API Key or connection issue"}. Double check your API Key configuration, captain!`;
  }
}

function handleAkiResult(data) {
  stopLoaderCommentary();

  // If AI is ready to make a guess
  if (data.is_ready_to_guess && data.guess) {
    currentQuestion = `AI Guess: ${data.guess}`;
    el.suspectedEntity.textContent = data.guess;
    el.guessCommentary.textContent = data.commentary || "Aki is looking absolutely confident about this. No DRS required!";
    showScreen("guess");
  } 
  // Otherwise, continue the questioning loop
  else {
    currentQuestion = data.next_question || "Is it an active IPL player?";
    el.activeQuestion.textContent = currentQuestion;
    el.turnCounter.textContent = `Question ${turnCount} / ${MAX_TURNS}`;
    el.liveCommentary.textContent = data.commentary || "Aki is loading the next ball. The batsman is taking guard...";
    showScreen("game");
  }
}

// --- Guess Screen Confirmation ---
function handleFinalDecision(isAkiCorrect) {
  isGameOver = true;
  showScreen("end");

  // Get the guessed entity name
  const guessedEntity = el.suspectedEntity.textContent;
  el.endTargetEntity.textContent = guessedEntity;
  el.endTotalTurns.textContent = turnCount - 1;

  if (isAkiCorrect) {
    // Victory for AI
    el.endEmoji.textContent = "🏆";
    el.endHeader.textContent = "Victory for the Commentator!";
    el.endHeader.style.color = "var(--color-gold)";
    el.endDescription.innerHTML = `Aki successfully decoded your brainwaves and guessed <strong class="accent-gold">${guessedEntity}</strong> in <span class="accent-turquoise">${turnCount - 1}</span> deliveries!`;
    el.endCommentary.textContent = `Aki's post-match analysis: "An absolute masterclass from the bowler! Sliced right through your defense. You played well, but my scouting team was simply ten steps ahead. Better luck next tournament!"`;
  } else {
    // Victory for User
    el.endEmoji.textContent = "🔥";
    el.endHeader.textContent = "You Defeated Aki!";
    el.endHeader.style.color = "var(--color-turquoise)";
    el.endDescription.innerHTML = `Aki failed to guess your target entity after <span class="accent-turquoise">${turnCount - 1}</span> questions! The correct answer remains in your vaults.`;
    el.endCommentary.textContent = `Aki's post-match analysis: "Ah, edge and gone! A massive upset here at the stadium. I tried the googly, the carrom ball, even the slower delivery, but you played it with an absolute straight bat. A brilliant innings from you, captain!"`;
  }

  // Populate history accordion list
  populateHistoryList();
}

// --- History & Accordion Management ---
function populateHistoryList() {
  el.historyList.innerHTML = "";
  
  if (gameHistory.length === 0) {
    el.historyList.innerHTML = `<div class="history-row" style="justify-content: center; color: var(--color-text-gray)">No deliveries played in this match.</div>`;
    return;
  }

  const tableHeader = `
    <div class="history-row" style="border-bottom: 2px solid rgba(255,255,255,0.1); font-weight: bold; color: var(--color-gold)">
      <span>DELIVERY</span>
      <span>USER RULING</span>
    </div>
  `;
  el.historyList.insertAdjacentHTML("beforeend", tableHeader);

  gameHistory.forEach((item, index) => {
    let answerClass = "dont know";
    if (item.answer.toLowerCase() === "yes") answerClass = "yes";
    if (item.answer.toLowerCase() === "no") answerClass = "no";

    const rowHTML = `
      <div class="history-row">
        <div class="history-q"><strong>Ball ${index + 1}:</strong> ${item.question}</div>
        <div class="history-a ${answerClass}">${item.answer}</div>
      </div>
    `;
    el.historyList.insertAdjacentHTML("beforeend", rowHTML);
  });
}

function toggleHistoryView() {
  const isHidden = el.historyList.classList.contains("hidden");
  if (isHidden) {
    el.historyList.classList.remove("hidden");
    el.toggleHistoryBtn.textContent = "Hide Match Statistics (DRS Review)";
  } else {
    el.historyList.classList.add("hidden");
    el.toggleHistoryBtn.textContent = "Show Match Statistics (DRS Review)";
  }
}

// --- Reset to Play Again ---
function resetToStart() {
  gameHistory = [];
  turnCount = 1;
  isGameOver = false;
  currentQuestion = "";
  showScreen("start");
}

// Mark application initialization completed
window.AkiCricketInitialized = true;
