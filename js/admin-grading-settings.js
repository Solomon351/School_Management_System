(function () {
  'use strict';

  const form = document.getElementById('grading-settings-form');
  if (!form) return;

  const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';
  const data = window.ResultsDemoData;
  const levelSelect = document.getElementById('school-level');
  const copySelect = document.getElementById('copy-level');
  const copyButton = document.getElementById('copy-rules');
  const scorePartsContainer = document.getElementById('score-parts');
  const gradingRowsContainer = document.getElementById('grading-rows');
  const scoreTotal = document.getElementById('score-total');
  const scoreError = document.getElementById('score-error');
  const gradingError = document.getElementById('grading-error');
  const saveButton = document.getElementById('save-settings');
  const message = document.getElementById('form-message');
  const demoNotice = document.getElementById('grading-demo-notice');
  const templateSelect = document.getElementById('grading-template');
  const passMarkInput = document.getElementById('pass-mark');
  const promotionMarkInput = document.getElementById('promotion-mark');

  const emptySettings = () => ({
    scoreParts: [{ name: '', maximumMarks: '' }],
    gradingScale: [{ from: '', to: '', grade: '', remark: '' }],
    passMark: 40,
    yearlyPromotionMark: 40,
    thirdTermRule: 'yearly-average',
    reportCardOptions: {
      showClassPosition: false,
      showClassAverage: false,
      showSubjectPosition: false
    }
  });

  let editingByLevel = {};
  let validationTouched = false;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getCurrentSettings() {
    const scoreParts = [...scorePartsContainer.querySelectorAll('[data-score-part]')].map((row) => ({
      name: row.querySelector('[data-score-name]').value.trim(),
      maximumMarks: row.querySelector('[data-score-marks]').value === '' ? '' : Number(row.querySelector('[data-score-marks]').value)
    }));
    const gradingScale = [...gradingRowsContainer.querySelectorAll('[data-grade-row]')].map((row) => ({
      from: row.querySelector('[data-grade-from]').value === '' ? '' : Number(row.querySelector('[data-grade-from]').value),
      to: row.querySelector('[data-grade-to]').value === '' ? '' : Number(row.querySelector('[data-grade-to]').value),
      grade: row.querySelector('[data-grade-value]').value.trim(),
      remark: row.querySelector('[data-grade-remark]').value.trim()
    }));
    const selectedRule = form.querySelector('input[name="third-term-rule"]:checked');

    return {
      scoreParts,
      gradingScale,
      passMark: passMarkInput.value === '' ? '' : Number(passMarkInput.value),
      yearlyPromotionMark: promotionMarkInput.value === '' ? '' : Number(promotionMarkInput.value),
      thirdTermRule: selectedRule ? selectedRule.value : '',
      reportCardOptions: {
        showClassPosition: document.getElementById('show-class-position').checked,
        showClassAverage: document.getElementById('show-class-average').checked,
        showSubjectPosition: document.getElementById('show-subject-position').checked
      }
    };
  }

  function renderScoreParts(parts) {
    scorePartsContainer.innerHTML = parts.map((part) => `
      <div data-score-part class="grid gap-3 rounded-input border border-border bg-bg p-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
        <div>
          <label class="mb-1.5 block text-xs font-semibold text-text">Score part name</label>
          <input data-score-name type="text" aria-label="Score part name" value="${escapeHtml(part.name)}" class="w-full rounded-input border border-border bg-card px-3.5 py-2.5 text-sm text-text placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-semibold text-text">Maximum marks</label>
          <input data-score-marks type="number" min="0" step="0.01" aria-label="Maximum marks" value="${escapeHtml(part.maximumMarks)}" class="w-full rounded-input border border-border bg-card px-3.5 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
        </div>
        <button type="button" data-remove-score class="inline-flex h-10 items-center justify-center rounded-input border border-border bg-card px-3 text-sm font-medium text-muted transition-colors hover:border-danger hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Remove
        </button>
      </div>
    `).join('');
    validateSettings();
  }

  function renderGrades(rows) {
    gradingRowsContainer.innerHTML = rows.map((row) => `
      <tr data-grade-row class="border-b border-border">
        <td class="px-2 py-2">
          <label class="sr-only">From score</label>
          <input data-grade-from type="number" min="0" max="100" step="1" aria-label="From score" value="${escapeHtml(row.from)}" class="w-full rounded-input border border-border bg-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
        </td>
        <td class="px-2 py-2">
          <label class="sr-only">To score</label>
          <input data-grade-to type="number" min="0" max="100" step="1" aria-label="To score" value="${escapeHtml(row.to)}" class="w-full rounded-input border border-border bg-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
        </td>
        <td class="px-2 py-2">
          <label class="sr-only">Grade</label>
          <input data-grade-value type="text" aria-label="Grade" value="${escapeHtml(row.grade)}" class="w-full rounded-input border border-border bg-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
        </td>
        <td class="px-2 py-2">
          <label class="sr-only">Remark</label>
          <input data-grade-remark type="text" aria-label="Remark" value="${escapeHtml(row.remark)}" class="w-full rounded-input border border-border bg-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
        </td>
        <td class="px-2 py-2 text-right">
          <button type="button" data-remove-grade class="rounded-input border border-border bg-card px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-danger hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Remove
          </button>
        </td>
      </tr>
    `).join('');
    validateSettings();
  }

  function showMessage(text, success) {
    message.textContent = text;
    message.classList.remove('hidden', 'border-success/20', 'bg-success/10', 'text-success', 'border-danger', 'bg-danger/10', 'text-danger');
    message.classList.add(...(success
      ? ['border-success/20', 'bg-success/10', 'text-success']
      : ['border-danger', 'bg-danger/10', 'text-danger']));
    message.classList.remove('hidden');
  }

  function showValidationError(element, text) {
    element.textContent = text;
    element.classList.toggle('hidden', !text);
  }

  function validateScoreParts(settings) {
    let total = 0;
    let fieldsValid = settings.scoreParts.length > 0;
    settings.scoreParts.forEach((part) => {
      const nameValid = Boolean(part.name);
      const marksValid = Number.isFinite(part.maximumMarks) && part.maximumMarks >= 0;
      fieldsValid = fieldsValid && nameValid && marksValid;
      if (marksValid) total += part.maximumMarks;
    });

    scoreTotal.textContent = `Total: ${Number(total.toFixed(2))} / 100`;
    const totalValid = Math.abs(total - 100) < 0.000001;
    const valid = fieldsValid && totalValid;
    scoreTotal.classList.toggle('text-danger', !valid);
    scoreTotal.classList.toggle('text-success', valid);

    let error = '';
    if (!settings.scoreParts.length) {
      error = 'Add at least one score part.';
    } else if (settings.scoreParts.some((part) => !part.name)) {
      error = 'Every score part needs a name.';
    } else if (settings.scoreParts.some((part) => !Number.isFinite(part.maximumMarks) || part.maximumMarks < 0)) {
      error = 'Maximum marks must be zero or greater.';
    } else if (!totalValid) {
      error = 'Score parts must add up to exactly 100.';
    }
    showValidationError(scoreError, validationTouched || error ? error : '');
    return valid;
  }

  function validateGradingScale(settings) {
    const rows = settings.gradingScale;
    let error = '';

    if (!rows.length) {
      error = 'Add grading rows that cover scores from 0 to 100.';
    } else if (rows.some((row) => !Number.isInteger(row.from) || !Number.isInteger(row.to) || row.from < 0 || row.from > 100 || row.to < 0 || row.to > 100)) {
      error = 'From and To scores must be whole numbers from 0 to 100.';
    } else if (rows.some((row) => !row.grade || !row.remark)) {
      error = 'Every grading row needs a grade and a remark.';
    } else {
      const orderedRows = rows.slice().sort((a, b) => a.from - b.from);
      if (orderedRows[0].from !== 0 || orderedRows[orderedRows.length - 1].to !== 100) {
        error = 'The grading scale must cover the full range from 0 to 100.';
      } else {
        for (let index = 0; index < orderedRows.length; index += 1) {
          if (orderedRows[index].from > orderedRows[index].to) {
            error = 'Each From score must be less than or equal to its To score.';
            break;
          }
          if (index > 0 && orderedRows[index].from !== orderedRows[index - 1].to + 1) {
            error = orderedRows[index].from <= orderedRows[index - 1].to
              ? 'Grading ranges overlap.'
              : 'There is a gap between grading ranges.';
            break;
          }
        }
      }
    }

    showValidationError(gradingError, validationTouched || error ? error : '');
    return !error;
  }

  function validateMark(input, errorElement, label) {
    const value = input.value === '' ? NaN : Number(input.value);
    const valid = Number.isInteger(value) && value >= 0 && value <= 100;
    showValidationError(errorElement, valid ? '' : `${label} must be a whole number from 0 to 100.`);
    input.classList.toggle('border-danger', !valid);
    return valid;
  }

  function validateSettings() {
    if (!scorePartsContainer || !gradingRowsContainer) return false;
    const settings = getCurrentSettings();
    const scoreValid = validateScoreParts(settings);
    const gradesValid = validateGradingScale(settings);
    const passValid = validateMark(passMarkInput, document.getElementById('pass-mark-error'), 'Pass mark');
    const promotionValid = validateMark(promotionMarkInput, document.getElementById('promotion-mark-error'), 'Yearly promotion mark');
    saveButton.disabled = !(demoMode && scoreValid && gradesValid && passValid && promotionValid && settings.thirdTermRule);
    return scoreValid && gradesValid && passValid && promotionValid && Boolean(settings.thirdTermRule);
  }

  function loadSettings(level) {
    let value;
    if (editingByLevel[level]) {
      value = clone(editingByLevel[level]);
    } else if (demoMode && data) {
      value = data.getSettings(level) || emptySettings();
    } else {
      value = emptySettings();
    }
    renderScoreParts(value.scoreParts || []);
    renderGrades(value.gradingScale || []);
    passMarkInput.value = value.passMark == null ? '' : value.passMark;
    promotionMarkInput.value = value.yearlyPromotionMark == null ? '' : value.yearlyPromotionMark;
    const rule = form.querySelector(`input[name="third-term-rule"][value="${value.thirdTermRule}"]`);
    if (rule) rule.checked = true;
    const options = value.reportCardOptions || {};
    document.getElementById('show-class-position').checked = Boolean(options.showClassPosition);
    document.getElementById('show-class-average').checked = Boolean(options.showClassAverage);
    document.getElementById('show-subject-position').checked = Boolean(options.showSubjectPosition);
    validationTouched = false;
    validateSettings();
  }

  function cacheCurrentLevel() {
    editingByLevel[levelSelect.value] = getCurrentSettings();
  }

  function addScorePart() {
    const current = getCurrentSettings();
    current.scoreParts.push({ name: '', maximumMarks: '' });
    renderScoreParts(current.scoreParts);
  }

  function addGradeRow() {
    const current = getCurrentSettings();
    current.gradingScale.push({ from: '', to: '', grade: '', remark: '' });
    renderGrades(current.gradingScale);
  }

  document.getElementById('add-score-part').addEventListener('click', addScorePart);
  document.getElementById('add-grade-row').addEventListener('click', addGradeRow);

  scorePartsContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-score]');
    if (!button) return;
    button.closest('[data-score-part]').remove();
    validateSettings();
  });

  gradingRowsContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-grade]');
    if (!button) return;
    button.closest('[data-grade-row]').remove();
    validateSettings();
  });

  form.addEventListener('input', () => {
    validationTouched = true;
    message.classList.add('hidden');
    validateSettings();
  });

  form.addEventListener('change', () => {
    validationTouched = true;
    message.classList.add('hidden');
    validateSettings();
  });

  levelSelect.addEventListener('change', () => {
    cacheCurrentLevel();
    message.classList.add('hidden');
    loadSettings(levelSelect.value);
  });

  templateSelect.addEventListener('change', () => {
    if (!templateSelect.value || !data) return;
    renderGrades(clone(data.templates[templateSelect.value]));
    validationTouched = true;
    templateSelect.value = '';
  });

  copyButton.addEventListener('click', () => {
    const fromLevel = copySelect.value;
    if (!fromLevel) {
      showMessage('Choose a school level to copy rules from.', false);
      return;
    }
    if (fromLevel === levelSelect.value) {
      showMessage('Choose a different school level to copy rules from.', false);
      return;
    }
    const rules = editingByLevel[fromLevel] || (demoMode && data ? data.getSettings(fromLevel) : null);
    if (!rules) {
      showMessage('There are no saved rules to copy from that level.', false);
      return;
    }
    editingByLevel[levelSelect.value] = clone(rules);
    loadSettings(levelSelect.value);
    validationTouched = true;
    validateSettings();
    showMessage('Rules copied. Review them and save to apply them to this level.', true);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    validationTouched = true;
    if (!validateSettings()) {
      showMessage('Fix the highlighted settings before saving.', false);
      return;
    }
    if (!demoMode || !data) {
      showMessage('Demo mode is required to save settings. Add ?demo=1 to the URL.', false);
      return;
    }

    const settings = getCurrentSettings();
    const saved = data.saveSettings(levelSelect.value, settings);
    editingByLevel[levelSelect.value] = clone(saved);
    showMessage('Grading settings saved for this demo visit.', true);
  });

  if (!demoMode) {
    demoNotice.classList.remove('hidden');
    copyButton.disabled = true;
  }
  loadSettings(levelSelect.value);
})();
