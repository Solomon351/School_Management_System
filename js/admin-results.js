(function () {
  const page = document.querySelector('[data-results-page]');
  if (!page) return;

  const form = document.getElementById('results-form');
  const serialInput = document.getElementById('results-serial');
  const pinInput = document.getElementById('results-pin');
  const placeholder = document.getElementById('results-placeholder');
  const resultsContent = document.getElementById('results-content');
  const rowsContainer = document.getElementById('results-rows');
  const summary = document.getElementById('results-summary');
  const feedback = document.getElementById('results-feedback');
  const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';

  let results = [];
  if (demoMode) {
    // TEMPORARY: remove before final merge
    results = [
      { subject: 'Mathematics', score: 78 },
      { subject: 'English', score: 72 },
      { subject: 'Physics', score: 65 },
      { subject: 'Biology', score: 81 },
      { subject: 'Civic Education', score: 88 },
      { subject: 'Chemistry', score: 59 }
    ];
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function gradeForScore(score) {
    return score >= 70 ? 'A' : score >= 60 ? 'B' : 'C';
  }

  function gradeClass(grade) {
    if (grade === 'A') return 'bg-success/10 text-success';
    if (grade === 'B') return 'bg-warning/10 text-warning';
    return 'bg-danger/10 text-danger';
  }

  function showResults() {
    const total = results.reduce((sum, result) => sum + result.score, 0);
    const average = (total / results.length).toFixed(1);

    rowsContainer.innerHTML = results.map((result) => {
      const grade = gradeForScore(result.score);
      return `<tr class="border-b border-border last:border-0">
        <td class="px-4 py-3 text-sm font-medium text-text">${escapeHtml(result.subject)}</td>
        <td class="px-4 py-3 text-sm text-text">${result.score}</td>
        <td class="px-4 py-3"><span class="inline-flex min-w-8 justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${gradeClass(grade)}">${grade}</span></td>
      </tr>`;
    }).join('');
    summary.textContent = `Total: ${total} · Average: ${average} · Position: 4th`;
    placeholder.classList.add('hidden');
    resultsContent.classList.remove('hidden');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    feedback.classList.add('hidden');
    resultsContent.classList.add('hidden');
    placeholder.classList.remove('hidden');
    rowsContainer.innerHTML = '';
    summary.textContent = '';

    if (!serialInput.value.trim() || !pinInput.value.trim()) {
      placeholder.textContent = 'Enter your serial number and PIN to check your result.';
      return;
    }

    if (!demoMode || results.length === 0) {
      placeholder.textContent = 'No result data is available. Result data will appear here when it is provided.';
      return;
    }

    if (serialInput.value.trim().toUpperCase() !== 'SC001') {
      placeholder.textContent = 'Invalid serial number or PIN. Please check your details and try again.';
      return;
    }

    placeholder.textContent = '';
    showResults();
  });
})();
