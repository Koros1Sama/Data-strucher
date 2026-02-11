/**
 * exam-static-interactive.js
 * Interactive quiz mode for static HTML exam pages (Gemini, Predicted).
 * These pages have pre-rendered HTML with .option.correct classes.
 * This script hides answers and adds click-to-select, undo, reset, and score tracking.
 */
(function () {
  "use strict";

  let selectedCount = 0;
  let correctCount = 0;
  const totalQuestions = document.querySelectorAll(".question-card").length;

  // --- 1. Initialize: hide answers and add interactive elements ---
  function init() {
    const cards = document.querySelectorAll(".question-card");

    cards.forEach((card, idx) => {
      card.dataset.answered = "false";
      card.dataset.qindex = idx;

      // Hide explanation box initially
      const explanation = card.querySelector(".explanation-box");
      if (explanation) {
        explanation.style.display = "none";
        explanation.dataset.originalDisplay = "";
      }

      // Remove the visual 'correct' class but save the data
      const options = card.querySelectorAll(".option");
      options.forEach((opt) => {
        if (opt.classList.contains("correct")) {
          opt.dataset.correct = "true";
          opt.classList.remove("correct");
        } else {
          opt.dataset.correct = "false";
        }
        // Make options clickable
        opt.style.cursor = "pointer";
        opt.addEventListener("click", handleOptionClick);
      });

      // Add undo button (hidden initially)
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "question-actions";
      actionsDiv.style.display = "none";
      actionsDiv.innerHTML = `<button class="undo-btn" data-qindex="${idx}">↩️ تراجع</button>`;
      card.appendChild(actionsDiv);

      actionsDiv
        .querySelector(".undo-btn")
        .addEventListener("click", handleUndo);
    });

    // Add score counter if not exists
    let scoreCounter = document.getElementById("score-counter");
    if (!scoreCounter) {
      scoreCounter = document.createElement("div");
      scoreCounter.className = "score-counter";
      scoreCounter.id = "score-counter";
      scoreCounter.innerHTML = `📊 <span id="score-text">0 / ${totalQuestions}</span>`;
      document.body.appendChild(scoreCounter);
    } else {
      const scoreText = scoreCounter.querySelector("#score-text");
      if (scoreText) scoreText.textContent = `0 / ${totalQuestions}`;
    }

    // Add reset button
    const existingReset = document.getElementById("reset-all");
    if (!existingReset) {
      const resetBtn = document.createElement("button");
      resetBtn.id = "reset-all";
      resetBtn.className = "reset-all-btn";
      resetBtn.innerHTML = "🔄 إعادة تعيين";
      document.body.appendChild(resetBtn);
    }
    document
      .getElementById("reset-all")
      .addEventListener("click", handleResetAll);

    // Rewire toggle button
    setupToggle();
  }

  // --- 2. Handle option click ---
  function handleOptionClick(e) {
    const option = e.currentTarget;
    const card = option.closest(".question-card");
    if (card.dataset.answered === "true") return;

    card.dataset.answered = "true";
    const isCorrect = option.dataset.correct === "true";

    option.classList.add("selected");
    if (isCorrect) {
      option.classList.add("correct-answer");
      correctCount++;
    } else {
      option.classList.add("wrong-answer");
      // Reveal the correct answer
      card.querySelectorAll(".option").forEach((o) => {
        if (o.dataset.correct === "true") o.classList.add("reveal-correct");
      });
    }

    // Dim unselected options
    card.querySelectorAll(".option").forEach((o) => {
      if (
        !o.classList.contains("selected") &&
        !o.classList.contains("reveal-correct")
      )
        o.classList.add("dimmed");
    });

    // Show explanation
    const explanation = card.querySelector(".explanation-box");
    if (explanation) explanation.style.display = "";

    // Show undo button
    const actions = card.querySelector(".question-actions");
    if (actions) actions.style.display = "flex";

    selectedCount++;
    updateScore();
  }

  // --- 3. Handle undo ---
  function handleUndo(e) {
    const qindex = e.currentTarget.dataset.qindex;
    const card = document.querySelector(
      `.question-card[data-qindex="${qindex}"]`
    );
    if (!card || card.dataset.answered !== "true") return;

    // Check if this was a correct answer
    const selectedOpt = card.querySelector(".option.selected");
    if (selectedOpt && selectedOpt.dataset.correct === "true") {
      correctCount--;
    }
    selectedCount--;

    // Reset all options
    card.querySelectorAll(".option").forEach((o) => {
      o.classList.remove(
        "selected",
        "correct-answer",
        "wrong-answer",
        "reveal-correct",
        "dimmed",
        "correct"
      );
    });

    // Hide explanation
    const explanation = card.querySelector(".explanation-box");
    if (explanation) explanation.style.display = "none";

    // Hide undo button
    const actions = card.querySelector(".question-actions");
    if (actions) actions.style.display = "none";

    card.dataset.answered = "false";
    updateScore();
  }

  // --- 4. Handle reset all ---
  function handleResetAll() {
    if (
      selectedCount > 0 &&
      !confirm("هل أنت متأكد من إعادة تعيين جميع الإجابات؟")
    )
      return;

    selectedCount = 0;
    correctCount = 0;

    document.querySelectorAll(".question-card").forEach((card) => {
      card.dataset.answered = "false";
      card.querySelectorAll(".option").forEach((o) => {
        o.classList.remove(
          "selected",
          "correct-answer",
          "wrong-answer",
          "reveal-correct",
          "dimmed",
          "correct"
        );
      });
      const explanation = card.querySelector(".explanation-box");
      if (explanation) explanation.style.display = "none";
      const actions = card.querySelector(".question-actions");
      if (actions) actions.style.display = "none";
    });

    // Reset show-all state
    const toggleBtn = document.getElementById("toggle-answers");
    if (toggleBtn) {
      toggleBtn.innerHTML = "👁️ إظهار الكل";
      toggleBtn.classList.remove("hidden-mode");
    }
    showAllActive = false;

    updateScore();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- 5. Setup toggle button ---
  let showAllActive = false;
  function setupToggle() {
    const toggleBtn = document.getElementById("toggle-answers");
    if (!toggleBtn) return;

    // Reset button text for quiz mode
    toggleBtn.innerHTML = "👁️ إظهار الكل";
    toggleBtn.classList.remove("hidden-mode");

    // Remove old listeners by replacing element
    const newBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);

    newBtn.addEventListener("click", () => {
      showAllActive = !showAllActive;
      if (showAllActive) {
        // Show all correct answers and explanations
        document.querySelectorAll(".option").forEach((opt) => {
          if (opt.dataset.correct === "true") opt.classList.add("correct");
        });
        document.querySelectorAll(".explanation-box").forEach((e) => {
          e.style.display = "";
        });
        newBtn.innerHTML = "👁️ إخفاء الكل";
        newBtn.classList.add("hidden-mode");
      } else {
        // Hide unanswered
        document.querySelectorAll(".option.correct").forEach((opt) => {
          opt.classList.remove("correct");
        });
        document.querySelectorAll(".explanation-box").forEach((e) => {
          const card = e.closest(".question-card");
          if (card.dataset.answered !== "true") e.style.display = "none";
        });
        newBtn.innerHTML = "👁️ إظهار الكل";
        newBtn.classList.remove("hidden-mode");
      }
    });
  }

  // --- 6. Update score display ---
  function updateScore() {
    const scoreText = document.getElementById("score-text");
    if (scoreText) scoreText.textContent = `${correctCount} / ${selectedCount}`;
  }

  // Remove body.hide-answers class if present (start in quiz mode)
  document.body.classList.remove("hide-answers");

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
