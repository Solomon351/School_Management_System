(function () {
  'use strict';

  const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';
  const data = window.ResultsDemoData;
  const engine = window.ResultsEngine;
  const content = document.getElementById('score-entry-content');
  const emptyState = document.getElementById('score-demo-empty');
  const viewingAsWrap = document.getElementById('viewing-as-wrap');
  const viewingAsSelect = document.getElementById('viewing-as');
  const sessionSelect = document.getElementById('score-session');
  const termSelect = document.getElementById('score-term');
  const classSelect = document.getElementById('score-class');
  const subjectSelect = document.getElementById('score-subject');
  const rulesNote = document.getElementById('grading-rules-note');
  const statusBadge = document.getElementById('score-status');
  const message = document.getElementById('score-message');
  const tableEmpty = document.getElementById('scores-empty');
  const tableWrap = document.getElementById('scores-table-wrap');
  const tableHead = document.getElementById('scores-head');
  const tableRows = document.getElementById('scores-rows');
  const saveDraftButton = document.getElementById('save-draft');
  const submitButton = document.getElementById('submit-scores');
  const publishButton = document.getElementById('publish-results');
  const reopenButton = document.getElementById('reopen-scores');
  const actionHint = document.getElementById('score-action-hint');
  const submittedByLabel = document.getElementById('submitted-by');
  const subjectTeacherLabel = document.getElementById('subject-teacher');
  const formTeacherLabel = document.getElementById('form-teacher');
  const enteredByLabel = document.getElementById('entered-by');
  const lastUpdatedLabel = document.getElementById('last-updated');
  const teacherRoleNote = document.getElementById('teacher-role-note');
  const scoreInputsCache = {};

  // TEMPORARY: the server will use the logged-in user instead of this switch
  let role = 'admin';
  let currentTeacherId = '';
  let selectedClass = null;
  let selectedSubject = null;
  let selectedSettings = null;
  let selectedKey = '';
  let students = [];
  let scores = {};
  let currentStatus = 'Draft';
  let locked = true;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function formatScore(value) {
    if (!Number.isFinite(Number(value))) return '—';
    return Number(value).toLocaleString('en-NG', { maximumFractionDigits: 1 });
  }

  function getCurrentScoresFromTable() {
    if (!selectedKey || !tableRows.querySelector('[data-student-row]')) return scores;
    const updated = {};
    students.forEach((student) => {
      const row = tableRows.querySelector(`[data-student-id="${student.id}"]`);
      const studentScores = {};
      if (row) {
        row.querySelectorAll('[data-score-part]').forEach((input) => {
          const value = input.value.trim();
          studentScores[input.dataset.scorePart] = value === '' ? null : Number(value);
        });
      }
      updated[student.id] = studentScores;
    });
    scores = updated;
    scoreInputsCache[selectedKey] = clone(scores);
    return scores;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function showMessage(text, kind) {
    message.textContent = text;
    message.classList.remove('hidden', 'border-success/20', 'bg-success/10', 'text-success', 'border-danger', 'bg-danger/10', 'text-danger');
    if (kind === 'success') {
      message.classList.add('border-success/20', 'bg-success/10', 'text-success');
    } else {
      message.classList.add('border-danger', 'bg-danger/10', 'text-danger');
    }
    message.classList.remove('hidden');
  }

  function hideMessage() {
    message.classList.add('hidden');
  }

  function statusBadgeStyle(status) {
    const styles = {
      Draft: 'bg-muted/10 text-muted',
      Submitted: 'bg-warning/10 text-warning',
      Published: 'bg-success/10 text-success'
    };
    return styles[status] || styles.Draft;
  }

  function getCurrentTeacher() {
    return data.teachers.find((teacher) => teacher.staffId === currentTeacherId) || null;
  }

  function formatDemoDateTime(dateValue) {
    if (!dateValue) return '—';
    const date = new Date(dateValue);
    return date.toLocaleString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function getActorName() {
    if (role === 'admin') return 'Admin';
    const teacher = getCurrentTeacher();
    return teacher ? teacher.name : 'Teacher';
  }

  function getSubmissionName() {
    if (role === 'teacher') return getActorName();
    const assignedTeacher = selectedClass && selectedSubject
      ? data.teachers.find((teacher) => teacher.assignments.some((assignment) =>
        assignment.classId === selectedClass.id && assignment.subjectId === selectedSubject.id))
      : null;
    return assignedTeacher ? assignedTeacher.name : getActorName();
  }

  function updateTeacherInfo() {
    const subjectTeacher = selectedClass && selectedSubject
      ? data.teachers.find((teacher) => teacher.assignments.some((assignment) =>
        assignment.classId === selectedClass.id && assignment.subjectId === selectedSubject.id))
      : null;
    const formTeacher = selectedClass
      ? data.teachers.find((teacher) => teacher.staffId === selectedClass.formTeacherId)
      : null;
    const metadata = selectedKey ? data.getScoreMetadata(selectedKey) : null;

    subjectTeacherLabel.textContent = subjectTeacher
      ? `${subjectTeacher.name} (${subjectTeacher.staffId})`
      : selectedSubject ? 'Not assigned' : '—';
    formTeacherLabel.textContent = formTeacher
      ? `${formTeacher.name} (${formTeacher.staffId})`
      : selectedClass ? 'Not assigned' : '—';
    enteredByLabel.textContent = metadata ? metadata.enteredByName : '—';
    lastUpdatedLabel.textContent = metadata ? formatDemoDateTime(metadata.lastUpdated) : '—';

    const hasSubmission = currentStatus === 'Submitted' || currentStatus === 'Published';
    submittedByLabel.textContent = hasSubmission && metadata && metadata.submittedByName
      ? `Submitted by ${metadata.submittedByName}`
      : '';
    submittedByLabel.classList.toggle('hidden', !submittedByLabel.textContent);
  }

  function updateStatus(status) {
    currentStatus = status;
    statusBadge.textContent = status;
    statusBadge.className = `inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${statusBadgeStyle(status)}`;
    locked = status !== 'Draft';
    tableRows.querySelectorAll('[data-score-part]').forEach((input) => {
      input.disabled = locked;
    });
    const isAdmin = role === 'admin';
    teacherRoleNote.classList.toggle('hidden', isAdmin);
    saveDraftButton.disabled = locked || !demoMode;
    saveDraftButton.title = !demoMode
      ? 'Demo mode is required to save scores.'
      : locked ? 'Reopen this score sheet before saving a draft.' : '';
    submitButton.disabled = locked || !allStudentsComplete() || !demoMode;
    submitButton.title = !demoMode
      ? 'Demo mode is required to submit scores.'
      : locked ? 'Scores are already submitted or published.'
        : !allStudentsComplete() ? 'Complete all students’ scores before submitting.' : '';
    publishButton.classList.toggle('hidden', !isAdmin);
    reopenButton.classList.toggle('hidden', !isAdmin);
    publishButton.disabled = !isAdmin || status !== 'Submitted';
    publishButton.title = status !== 'Submitted'
      ? 'Publish is available after scores are submitted.'
      : '';
    reopenButton.disabled = !isAdmin || status !== 'Submitted';
    reopenButton.title = status !== 'Submitted'
      ? 'Reopen is available after scores are submitted.'
      : '';
    updateActionHint();
    updateTeacherInfo();
  }

  function updateActionHint(analyses) {
    if (currentStatus === 'Published') {
      actionHint.textContent = 'Published results cannot be changed. Contact the admin to reopen.';
      return;
    }
    if (currentStatus === 'Submitted') {
      actionHint.textContent = 'Scores submitted and locked. An admin can publish them or reopen them.';
      return;
    }

    const currentAnalyses = analyses || (
      selectedSettings && students.length ? collectAnalyses() : []
    );
    const enteredCount = currentAnalyses.filter((result) => result.complete).length;
    if (allStudentsComplete()) {
      actionHint.textContent = 'All scores entered. You can submit.';
    } else {
      actionHint.textContent = `Submit is available when every student has all their scores (${enteredCount} of ${students.length} entered).`;
    }
  }

  function getScoreError(input) {
    if (input.value.trim() === '') return '';
    const value = Number(input.value);
    const maximum = Number(input.max);
    if (!Number.isFinite(value) || value < 0 || value > maximum) {
      return `Enter a score from 0 to ${maximum}.`;
    }
    if (Math.abs(value * 10 - Math.round(value * 10)) > 0.000001) {
      return 'Use no more than one decimal place.';
    }
    return '';
  }

  function analyzeStudentScores(student, index, positions) {
    const row = tableRows.querySelector(`[data-student-id="${student.id}"]`);
    const studentScores = {};
    let incomplete = false;
    let invalid = false;

    if (row) {
      row.querySelectorAll('[data-score-part]').forEach((input) => {
        const error = getScoreError(input);
        const errorElement = document.getElementById(input.getAttribute('aria-describedby'));
        input.classList.toggle('border-danger', Boolean(error));
        input.classList.toggle('focus:border-danger', Boolean(error));
        input.setAttribute('aria-invalid', String(Boolean(error)));
        if (errorElement) {
          errorElement.textContent = error;
          errorElement.classList.toggle('hidden', !error);
        }
        if (error) {
          invalid = true;
          studentScores[input.dataset.scorePart] = NaN;
        } else if (input.value.trim() === '') {
          incomplete = true;
          studentScores[input.dataset.scorePart] = null;
        } else {
          studentScores[input.dataset.scorePart] = Number(input.value);
        }
      });
    }

    const result = invalid || incomplete
      ? { total: null, complete: false }
      : engine.calculateTotal(selectedSettings.scoreParts, studentScores);
    const grade = result.complete ? engine.getGradeAndRemark(result.total, selectedSettings.gradingScale) : null;
    const resultCells = row ? row.querySelectorAll('[data-result-cell]') : [];
    if (resultCells.length >= 4) {
      resultCells[0].textContent = invalid ? 'Invalid' : result.complete ? formatScore(result.total) : 'Incomplete';
      resultCells[0].classList.toggle('text-danger', invalid || (result.complete && !engine.isPassed(result.total, selectedSettings.passMark)));
      resultCells[1].textContent = result.complete && grade ? grade.grade : result.complete ? '—' : 'Incomplete';
      resultCells[2].textContent = result.complete && grade ? grade.remark : '—';
      resultCells[3].textContent = result.complete && positions[index] ? ordinal(positions[index]) : '—';
    }
    return {
      studentId: student.id,
      scores: studentScores,
      total: result.complete ? result.total : null,
      complete: result.complete,
      invalid
    };
  }

  function ordinal(position) {
    const remainder100 = position % 100;
    if (remainder100 >= 11 && remainder100 <= 13) return `${position}th`;
    switch (position % 10) {
      case 1: return `${position}st`;
      case 2: return `${position}nd`;
      case 3: return `${position}rd`;
      default: return `${position}th`;
    }
  }

  function collectAnalyses() {
    const rawScores = getCurrentScoresFromTable();
    const totals = students.map((student) => {
      const computed = engine.calculateTotal(selectedSettings.scoreParts, rawScores[student.id] || {});
      if (!computed.complete) return null;
      const hasPrecisionError = selectedSettings.scoreParts.some((part) => {
        const value = rawScores[student.id][part.name];
        return value != null && Math.abs(Number(value) * 10 - Math.round(Number(value) * 10)) > 0.000001;
      });
      return hasPrecisionError ? null : computed.total;
    });
    const positions = engine.getPositions(totals);
    return students.map((student, index) => analyzeStudentScores(student, index, positions));
  }

  function allStudentsComplete() {
    if (!students.length || !selectedSettings) return false;
    const rawScores = getCurrentScoresFromTable();
    return students.every((student) => {
      const studentScores = rawScores[student.id] || {};
      return selectedSettings.scoreParts.every((part) => {
        const score = studentScores[part.name];
        const value = Number(score);
        return score !== null && score !== '' && score !== undefined &&
          Number.isFinite(value) && value >= 0 && value <= Number(part.maximumMarks) &&
          Math.abs(value * 10 - Math.round(value * 10)) < 0.000001;
      });
    });
  }

  function updateSummary(analyses) {
    const completeTotals = analyses.filter((result) => result.complete).map((result) => result.total);
    const stats = engine.getClassStats(completeTotals.map((total) => ({ total })), selectedSettings.passMark);
    document.getElementById('stat-average').textContent = stats.average === null ? '—' : formatScore(stats.average);
    document.getElementById('stat-highest').textContent = stats.highest === null ? '—' : formatScore(stats.highest);
    document.getElementById('stat-lowest').textContent = stats.lowest === null ? '—' : formatScore(stats.lowest);
    document.getElementById('stat-passed').textContent = String(stats.passed);
    document.getElementById('stat-failed').textContent = String(stats.failed);
    document.getElementById('stat-entered').textContent = `${analyses.filter((result) => result.complete).length} of ${students.length} students`;
  }

  function refreshScores() {
    if (!selectedSettings || !students.length) return;
    const analyses = collectAnalyses();
    updateSummary(analyses);
    submitButton.disabled = locked || !allStudentsComplete() || !demoMode;
    submitButton.title = !demoMode
      ? 'Demo mode is required to submit scores.'
      : locked ? 'Scores are already submitted or published.'
        : !allStudentsComplete() ? 'Complete all students’ scores before submitting.' : '';
    updateActionHint(analyses);
  }

  function renderTable() {
    if (!students.length || !selectedSettings) {
      tableWrap.classList.add('hidden');
      tableEmpty.classList.remove('hidden');
      tableEmpty.textContent = 'No students or grading settings are available for this selection.';
      return;
    }

    tableEmpty.classList.add('hidden');
    tableWrap.classList.remove('hidden');
    tableHead.innerHTML = `
      <tr>
        <th scope="col" class="px-4 py-3">Student</th>
        ${selectedSettings.scoreParts.map((part) => `<th scope="col" class="px-3 py-3">${escapeHtml(part.name)} (${escapeHtml(part.maximumMarks)})</th>`).join('')}
        <th scope="col" class="px-4 py-3">Total</th>
        <th scope="col" class="px-4 py-3">Grade</th>
        <th scope="col" class="px-4 py-3">Remark</th>
        <th scope="col" class="px-4 py-3">Position</th>
      </tr>
    `;

    tableRows.innerHTML = students.map((student) => `
      <tr data-student-row data-student-id="${escapeHtml(student.id)}" class="admin-motion-row border-b border-border align-top">
        <th scope="row" class="min-w-48 px-4 py-3 text-left text-sm font-medium text-text">
          <div>${escapeHtml(student.name)}</div>
          <div class="mt-0.5 text-xs font-normal text-muted">${escapeHtml(student.id)}</div>
        </th>
        ${selectedSettings.scoreParts.map((part) => {
          const inputId = `score-${student.id}-${part.name.replace(/[^a-z0-9_-]/gi, '-')}`;
          const inputValue = scores[student.id] && scores[student.id][part.name] != null ? scores[student.id][part.name] : '';
          return `
            <td class="min-w-36 px-3 py-3">
              <input id="${inputId}" type="number" min="0" max="${escapeHtml(part.maximumMarks)}" step="0.1"
                data-score-part="${escapeHtml(part.name)}" aria-label="${escapeHtml(student.name)} ${escapeHtml(part.name)} score"
                aria-describedby="${inputId}-error" value="${escapeHtml(inputValue)}"
                class="w-24 rounded-input border border-border bg-bg px-2.5 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60">
              <p id="${inputId}-error" class="mt-1 hidden max-w-36 text-xs font-medium text-danger" role="alert"></p>
            </td>
          `;
        }).join('')}
        <td data-result-cell class="whitespace-nowrap px-4 py-3 text-sm font-semibold text-text">Incomplete</td>
        <td data-result-cell class="px-4 py-3 text-sm text-text">Incomplete</td>
        <td data-result-cell class="px-4 py-3 text-sm text-text">—</td>
        <td data-result-cell class="px-4 py-3 text-sm text-text">—</td>
      </tr>
    `).join('');
    tableRows.querySelectorAll('[data-score-part]').forEach((input) => {
      input.disabled = locked;
    });
    refreshScores();
  }

  function loadSelection() {
    const classId = classSelect.value;
    const classEntry = data.classes.find((entry) => entry.id === classId);
    selectedClass = classEntry || null;
    const teacher = getCurrentTeacher();
    const teacherSubjectIds = teacher
      ? teacher.assignments.filter((assignment) => assignment.classId === classId).map((assignment) => assignment.subjectId)
      : null;
    const subjectOptions = classId
      ? (data.subjects[classId] || []).filter((subject) =>
        role === 'admin' || teacherSubjectIds.includes(subject.id))
      : [];
    const previousSubject = subjectSelect.value;
    subjectSelect.innerHTML = '<option value="">Select subject</option>' +
      subjectOptions.map((subject) => `<option value="${escapeHtml(subject.id)}">${escapeHtml(subject.name)}</option>`).join('');
    subjectSelect.disabled = subjectOptions.length === 0;
    subjectSelect.value = subjectOptions.some((subject) => subject.id === previousSubject)
      ? previousSubject
      : subjectOptions[0] ? subjectOptions[0].id : '';
    selectedSubject = subjectOptions.find((subject) => subject.id === subjectSelect.value) || null;

    if (!selectedClass || !selectedSubject) {
      selectedSettings = null;
      students = [];
      selectedKey = '';
      updateTeacherInfo();
      tableWrap.classList.add('hidden');
      tableEmpty.classList.remove('hidden');
      tableEmpty.textContent = role === 'teacher' && selectedClass
        ? 'You are not assigned to a subject in this class.'
        : 'Select a class and subject to enter scores.';
      return;
    }

    selectedSettings = data.getSettings(selectedClass.level);
    if (!selectedSettings || !selectedSettings.scoreParts.length) {
      tableWrap.classList.add('hidden');
      tableEmpty.classList.remove('hidden');
      tableEmpty.textContent = 'No grading rules are configured for this class level.';
      rulesNote.textContent = 'Grading rules in use: no rules configured';
      updateTeacherInfo();
      return;
    }

    const scaleName = selectedSettings.gradingScale.some((row) => row.grade === 'A1') ? 'WAEC style' : 'Simple A-F';
    const levelName = data.levels.find((level) => level.id === selectedClass.level).label;
    rulesNote.textContent = `Grading rules in use: ${levelName}, ${scaleName}, pass mark ${selectedSettings.passMark}`;
    students = data.students[selectedClass.id] || [];
    selectedKey = data.getScoreKey(sessionSelect.value, termSelect.value, selectedClass.id, selectedSubject.id);
    scores = scoreInputsCache[selectedKey]
      ? clone(scoreInputsCache[selectedKey])
      : data.getScores(selectedKey);
    students.forEach((student) => {
      if (!scores[student.id]) {
        scores[student.id] = {};
        selectedSettings.scoreParts.forEach((part) => {
          scores[student.id][part.name] = null;
        });
      }
    });
    currentStatus = data.getStatus(selectedKey);
    locked = currentStatus !== 'Draft';
    renderTable();
    updateStatus(currentStatus);
  }

  function populateClassOptions() {
    const teacher = getCurrentTeacher();
    const assignedClassIds = teacher
      ? [...new Set(teacher.assignments.map((assignment) => assignment.classId))]
      : null;
    const availableClasses = data.classes.filter((entry) =>
      role === 'admin' || assignedClassIds.includes(entry.id));
    const previousClass = classSelect.value;
    classSelect.innerHTML = '<option value="">Select class</option>' +
      availableClasses.map((entry) =>
        `<option value="${escapeHtml(entry.id)}">${escapeHtml(entry.name)}</option>`
      ).join('');
    classSelect.value = availableClasses.some((entry) => entry.id === previousClass)
      ? previousClass
      : availableClasses[0] ? availableClasses[0].id : '';
  }

  function populateViewingAs() {
    viewingAsSelect.innerHTML = '<option value="admin">Admin</option>' +
      data.teachers.map((teacher) =>
        `<option value="${escapeHtml(teacher.staffId)}">${escapeHtml(teacher.name)} (${escapeHtml(teacher.staffId)})</option>`
      ).join('');
    viewingAsWrap.classList.remove('hidden');
    viewingAsWrap.classList.add('flex');
  }

  function storeScores(status) {
    getCurrentScoresFromTable();
    data.saveScores(selectedKey, scores);
    const now = new Date().toISOString();
    const existingMetadata = data.getScoreMetadata(selectedKey) || {};
    data.setScoreMetadata(selectedKey, {
      enteredByName: getActorName(),
      enteredByStaffId: role === 'teacher' ? currentTeacherId : '',
      lastUpdated: now,
      submittedByName: status === 'Submitted'
        ? getSubmissionName()
        : existingMetadata.submittedByName || ''
    });
    data.setStatus(selectedKey, status);
    updateStatus(status);
    refreshScores();
  }

  function init() {
    if (!demoMode || !data || !engine) {
      content.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    populateViewingAs();
    populateClassOptions();
    teacherRoleNote.classList.add('hidden');

    sessionSelect.addEventListener('change', () => {
      hideMessage();
      loadSelection();
    });
    termSelect.addEventListener('change', () => {
      hideMessage();
      loadSelection();
    });
    classSelect.addEventListener('change', () => {
      hideMessage();
      loadSelection();
    });
    subjectSelect.addEventListener('change', () => {
      hideMessage();
      loadSelection();
    });

    viewingAsSelect.addEventListener('change', () => {
      getCurrentScoresFromTable();
      role = viewingAsSelect.value === 'admin' ? 'admin' : 'teacher';
      currentTeacherId = role === 'teacher' ? viewingAsSelect.value : '';
      hideMessage();
      populateClassOptions();
      loadSelection();
    });

    tableRows.addEventListener('input', (event) => {
      if (!event.target.matches('[data-score-part]')) return;
      hideMessage();
      refreshScores();
    });

    saveDraftButton.addEventListener('click', () => {
      if (currentStatus !== 'Draft') return;
      storeScores('Draft');
      showMessage('Draft scores saved for this demo visit.', 'success');
    });

    submitButton.addEventListener('click', () => {
      if (currentStatus !== 'Draft') return;
      if (!allStudentsComplete()) {
        showMessage('Enter a valid score for every score part for all students before submitting.', 'error');
        return;
      }
      storeScores('Submitted');
      showMessage('Scores submitted for this demo visit. Editing is now locked.', 'success');
    });

    publishButton.addEventListener('click', () => {
      if (role !== 'admin' || currentStatus !== 'Submitted') return;
      data.setStatus(selectedKey, 'Published');
      updateStatus('Published');
      showMessage('Results published. Parents can now see them with a scratch card.', 'success');
    });

    reopenButton.addEventListener('click', () => {
      if (role !== 'admin' || currentStatus !== 'Submitted') return;
      data.setStatus(selectedKey, 'Draft');
      updateStatus('Draft');
      showMessage('Scores reopened for editing in this demo visit.', 'success');
    });

    loadSelection();
  }

  init();
})();
