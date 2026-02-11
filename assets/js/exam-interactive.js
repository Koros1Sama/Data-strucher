/**
 * Shared interactive exam logic:
 *  - Click-to-reveal answers
 *  - Per-question undo button
 *  - Global reset button
 *  - Show-all toggle
 *  - Score counter
 *
 * Usage: define `const examData = [...]` before loading this script,
 *        and ensure the HTML has #questions-container, #toggle-answers,
 *        #reset-all, #score-text elements.
 */

let selectedCount = 0;
let correctCount = 0;

function updateScore() {
  document.getElementById('score-text').textContent = `${correctCount} / ${selectedCount}`;
}

function renderQuestions() {
  const container = document.getElementById('questions-container');
  container.innerHTML = '';
  examData.forEach(q => {
    const card = document.createElement('article');
    card.className = 'question-card';
    card.dataset.answered = 'false';

    let optionsHtml = q.options.map(opt =>
      `<li class="option" data-correct="${opt === q.correct}" data-qid="${q.id}">${opt}</li>`
    ).join('');

    card.innerHTML = `
      <div class="question-header">
        <span class="question-number">${q.id}</span>
        <p class="question-text">${q.question}</p>
      </div>
      <ul class="options-list">${optionsHtml}</ul>
      <div class="question-actions" id="actions-${q.id}" style="display:none">
        <button class="undo-btn" data-qid="${q.id}">↩️ تراجع</button>
      </div>
      <div class="explanation-box" id="explanation-${q.id}">
        <div class="explanation-title">💡 الشرح</div>
        <p class="explanation-text">${q.explanation}</p>
      </div>
      <a href="${q.topicLink}" class="topic-link" style="display:none" id="topic-link-${q.id}">📖 راجع: ${q.topicTitle}</a>
    `;
    container.appendChild(card);
  });

  // Click handlers for options
  document.querySelectorAll('.option').forEach(opt => opt.addEventListener('click', handleOptionClick));
  // Click handlers for undo buttons
  document.querySelectorAll('.undo-btn').forEach(btn => btn.addEventListener('click', handleUndo));
}

function handleOptionClick(e) {
  const option = e.currentTarget;
  const qid = option.dataset.qid;
  const card = option.closest('.question-card');

  if (card.dataset.answered === 'true') return;
  card.dataset.answered = 'true';

  const isCorrect = option.dataset.correct === 'true';
  option.classList.add('selected');

  if (isCorrect) {
    option.classList.add('correct-answer');
    correctCount++;
  } else {
    option.classList.add('wrong-answer');
    // Reveal the correct answer
    card.querySelectorAll('.option').forEach(o => {
      if (o.dataset.correct === 'true') o.classList.add('reveal-correct');
    });
  }

  // Dim other options
  card.querySelectorAll('.option').forEach(o => {
    if (!o.classList.contains('selected') && !o.classList.contains('reveal-correct')) {
      o.classList.add('dimmed');
    }
  });

  // Show explanation, topic link, and undo button
  document.getElementById(`explanation-${qid}`).classList.add('visible');
  document.getElementById(`topic-link-${qid}`).style.display = 'inline-flex';
  document.getElementById(`actions-${qid}`).style.display = 'flex';

  selectedCount++;
  updateScore();
}

function handleUndo(e) {
  const qid = e.currentTarget.dataset.qid;
  const card = e.currentTarget.closest('.question-card');
  resetQuestion(card, qid);
}

function resetQuestion(card, qid) {
  // Check if it was answered correctly (to decrement correctCount)
  const selectedOpt = card.querySelector('.option.selected');
  if (selectedOpt && selectedOpt.dataset.correct === 'true') {
    correctCount--;
  }
  if (card.dataset.answered === 'true') {
    selectedCount--;
  }

  card.dataset.answered = 'false';

  // Remove all visual feedback classes
  card.querySelectorAll('.option').forEach(o => {
    o.classList.remove('selected', 'correct-answer', 'wrong-answer', 'reveal-correct', 'dimmed', 'correct');
  });

  // Hide explanation, topic link, and undo
  document.getElementById(`explanation-${qid}`).classList.remove('visible');
  document.getElementById(`topic-link-${qid}`).style.display = 'none';
  document.getElementById(`actions-${qid}`).style.display = 'none';

  updateScore();
}

function resetAll() {
  examData.forEach(q => {
    const card = document.querySelector(`.question-card:nth-child(${q.id})`);
    if (card && card.dataset.answered === 'true') {
      resetQuestion(card, q.id);
    }
    // Also clear show-all state
    if (card) {
      card.querySelectorAll('.option').forEach(o => o.classList.remove('correct'));
      const expBox = document.getElementById(`explanation-${q.id}`);
      if (expBox) expBox.classList.remove('visible');
      const topicLink = document.getElementById(`topic-link-${q.id}`);
      if (topicLink) topicLink.style.display = 'none';
    }
  });
  selectedCount = 0;
  correctCount = 0;
  updateScore();

  // Reset show-all state
  showAll = false;
  const toggleBtn = document.getElementById('toggle-answers');
  toggleBtn.innerHTML = '👁️ إظهار الكل';
  toggleBtn.classList.remove('hidden-mode');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show-all toggle
let showAll = false;
function initToggleBtn() {
  const toggleBtn = document.getElementById('toggle-answers');
  toggleBtn.addEventListener('click', () => {
    showAll = !showAll;
    if (showAll) {
      document.querySelectorAll('.option').forEach(opt => {
        if (opt.dataset.correct === 'true') opt.classList.add('correct');
      });
      document.querySelectorAll('.explanation-box').forEach(e => e.classList.add('visible'));
      document.querySelectorAll('.topic-link').forEach(l => l.style.display = 'inline-flex');
      toggleBtn.innerHTML = '👁️ إخفاء الكل';
      toggleBtn.classList.add('hidden-mode');
    } else {
      document.querySelectorAll('.option.correct').forEach(opt => opt.classList.remove('correct'));
      document.querySelectorAll('.explanation-box').forEach(e => {
        const card = e.closest('.question-card');
        if (card.dataset.answered !== 'true') e.classList.remove('visible');
      });
      document.querySelectorAll('.topic-link').forEach(l => {
        const card = l.closest('.question-card');
        if (card.dataset.answered !== 'true') l.style.display = 'none';
      });
      toggleBtn.innerHTML = '👁️ إظهار الكل';
      toggleBtn.classList.remove('hidden-mode');
    }
  });
}

// Reset-all button
function initResetBtn() {
  const resetBtn = document.getElementById('reset-all');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (selectedCount === 0) return;
      resetAll();
    });
  }
}

// Initialize
renderQuestions();
initToggleBtn();
initResetBtn();
