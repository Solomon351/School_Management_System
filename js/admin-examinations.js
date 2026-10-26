(function () {
  const page = document.querySelector('[data-examinations-page]');
  if (!page) return;

  const search = document.getElementById('exam-search');
  const classFilter = document.getElementById('exam-class-filter');
  const statusFilter = document.getElementById('exam-status-filter');
  const examEmpty = document.getElementById('exam-empty');
  const examTable = document.getElementById('exam-table');
  const examRows = document.getElementById('exam-rows');
  const cardEmpty = document.getElementById('exam-card-empty');
  const cardTable = document.getElementById('exam-card-table');
  const cardRows = document.getElementById('exam-card-rows');
  const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';

  let exams = [];
  let scratchCards = [];

  if (demoMode) {
    // TEMPORARY: remove before final merge
    exams = [
      { name: 'Mathematics', className: 'SS1', date: 'Nov 3', status: 'Published' },
      { name: 'English', className: 'SS1', date: 'Nov 5', status: 'Draft' },
      { name: 'Physics', className: 'SS2', date: 'Nov 8', status: 'Draft' }
    ];
    // TEMPORARY: remove before final merge
    scratchCards = [
      { pin: 'XXXX-XXXX-XXXX', serial: 'SC001', status: 'Available' },
      { pin: 'XXXX-XXXX-XXXX', serial: 'SC002', status: 'Done' },
      { pin: 'XXXX-XXXX-XXXX', serial: 'SC003', status: 'Available' }
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

  function statusBadge(status) {
    const color = status === 'Published' || status === 'Available' || status === 'Done'
      ? 'bg-success/10 text-success'
      : status === 'Draft' || status === 'Issued'
        ? 'bg-warning/10 text-warning'
        : 'bg-danger/10 text-danger';
    return `<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${color}">${escapeHtml(status)}</span>`;
  }

  function renderExams() {
    const query = search.value.trim().toLowerCase();
    const className = classFilter.value;
    const status = statusFilter.value;
    const visibleExams = exams.filter((exam) => (
      (!query || `${exam.name} ${exam.className} ${exam.date} ${exam.status}`.toLowerCase().includes(query))
      && (className === 'all' || exam.className === className)
      && (status === 'all' || exam.status === status)
    ));

    examRows.innerHTML = visibleExams.map((exam) => `
      <tr class="border-b border-border last:border-0">
        <td class="px-4 py-3 text-sm font-medium text-text">${escapeHtml(exam.name)}</td>
        <td class="px-4 py-3 text-sm text-text">${escapeHtml(exam.className)}</td>
        <td class="px-4 py-3 text-sm text-text">${escapeHtml(exam.date)}</td>
        <td class="px-4 py-3">${statusBadge(exam.status)}</td>
      </tr>`).join('');
    examTable.classList.toggle('hidden', visibleExams.length === 0);
    examEmpty.classList.toggle('hidden', visibleExams.length > 0);
    examEmpty.textContent = exams.length
      ? 'No exams match these filters.'
      : 'No exams are available. Exam schedule data will appear here when it is provided.';
  }

  function renderCards() {
    cardRows.innerHTML = scratchCards.map((card) => `
      <tr class="border-b border-border last:border-0">
        <td class="px-4 py-3 font-mono text-sm text-text">${escapeHtml(card.pin)}</td>
        <td class="px-4 py-3 text-sm text-text">${escapeHtml(card.serial)}</td>
        <td class="px-4 py-3">${statusBadge(card.status)}</td>
      </tr>`).join('');
    cardTable.classList.toggle('hidden', scratchCards.length === 0);
    cardEmpty.classList.toggle('hidden', scratchCards.length > 0);
  }

  Array.from(new Set(exams.map((exam) => exam.className))).forEach((className) => {
    const option = document.createElement('option');
    option.value = className;
    option.textContent = className;
    classFilter.append(option);
  });

  renderExams();
  renderCards();

  search.addEventListener('input', renderExams);
  classFilter.addEventListener('change', renderExams);
  statusFilter.addEventListener('change', renderExams);

  document.getElementById('exam-create').addEventListener('click', () => {
    const feedback = document.getElementById('exam-feedback');
    feedback.textContent = 'Exam creation is not available here yet.';
    feedback.classList.remove('hidden');
  });

  document.getElementById('exam-card-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const feedback = document.getElementById('exam-card-feedback');
    feedback.textContent = 'Card generation is not available here yet. No PINs were created.';
    feedback.classList.remove('hidden');
  });

  document.getElementById('exam-result-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const feedback = document.getElementById('exam-result-feedback');
    feedback.innerHTML = 'Result checking is available on the <a href="./results.html" class="font-semibold text-primary underline">My Results</a> page.';
    feedback.classList.remove('hidden');
  });
})();
