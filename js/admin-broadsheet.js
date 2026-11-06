(function () {
  'use strict';

  const page = document.querySelector('[data-broadsheet-page]');
  if (!page) return;

  const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';
  const data = window.ResultsDemoData;
  const engine = window.ResultsEngine;
  const sessionSelect = document.getElementById('broadsheet-session');
  const termSelect = document.getElementById('broadsheet-term');
  const classSelect = document.getElementById('broadsheet-class');
  const rulesNote = document.getElementById('broadsheet-rules-note');
  const headRow = document.getElementById('broadsheet-head');
  const bodyRows = document.getElementById('broadsheet-body');
  const emptyState = document.getElementById('broadsheet-empty');
  const content = document.getElementById('broadsheet-content');
  const averageField = document.getElementById('class-average');
  const highestField = document.getElementById('class-highest');
  const lowestField = document.getElementById('class-lowest');
  const countField = document.getElementById('class-count');
  const passedAllField = document.getElementById('class-passed-all');
  const subjectAverages = document.getElementById('subject-averages');
  const formTeacherName = document.getElementById('form-teacher-name');
  const printButton = document.getElementById('broadsheet-print');
  const exportButton = document.getElementById('broadsheet-export');
  let currentView = null;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function formatNumber(value, decimals = 1) {
    if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return '—';
    return Number(value).toLocaleString('en-NG', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
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

  function getClassById(classId) {
    return data.classes.find((entry) => entry.id === classId) || null;
  }

  function buildClassOptions() {
    classSelect.innerHTML = data.classes.map((entry) => (
      `<option value="${escapeHtml(entry.id)}">${escapeHtml(entry.name)}</option>`
    )).join('');
    classSelect.value = data.classes[0] ? data.classes[0].id : '';
  }

  function getStudentRows(classInfo, grading, subjects, students) {
    const session = sessionSelect.value;
    const term = termSelect.value.replace(/\s+Term$/i, '');
    const scoresBySubject = subjects.map((subject) => ({
      subject,
      records: data.getScores(data.getScoreKey(session, term, classInfo.id, subject.id))
    }));

    const rows = students.map((student) => {
      const subjectTotals = scoresBySubject.map(({ subject, records }) => {
        const result = engine.calculateTotal(grading.scoreParts, records[student.id] || {});
        return {
          subject,
          total: result.complete ? result.total : null,
          complete: result.complete
        };
      });
      const completeSubjects = subjectTotals.filter((entry) => entry.complete);
      const average = engine.getClassStats(
        completeSubjects.map((entry) => entry.total),
        grading.passMark
      ).average;

      return {
        student,
        subjectTotals,
        total: completeSubjects.length
          ? completeSubjects.reduce((sum, entry) => sum + entry.total, 0)
          : null,
        average,
        hasIncomplete: subjectTotals.some((entry) => !entry.complete)
      };
    });

    const positions = engine.getPositions(rows.map((row) => (
      row.hasIncomplete ? null : row.average
    )));

    return rows.map((row, index) => {
      const grade = !row.hasIncomplete && row.average !== null
        ? engine.getGradeAndRemark(row.average, grading.gradingScale)
        : null;
      return {
        ...row,
        position: positions[index],
        grade: grade ? grade.grade : '—'
      };
    });
  }

  function renderTable() {
    const classInfo = getClassById(classSelect.value);
    if (!classInfo) return;

    const grading = data.getSettings(classInfo.level);
    if (!grading) {
      throw new Error(`No grading settings are available for ${classInfo.name}.`);
    }

    const subjects = data.subjects[classInfo.id] || [];
    const students = data.students[classInfo.id] || [];
    const rows = getStudentRows(classInfo, grading, subjects, students);
    currentView = { classInfo, grading, subjects, rows };

    const levelName = (data.levels.find((level) => level.id === classInfo.level) || {}).label || classInfo.level;
    const firstGrade = grading.gradingScale[0];
    const lastGrade = grading.gradingScale[grading.gradingScale.length - 1];
    rulesNote.textContent = `Grading rules in use: ${levelName}, ${firstGrade.grade}-${lastGrade.grade} style, pass mark ${grading.passMark}`;

    const formTeacher = data.teachers.find((teacher) => teacher.staffId === classInfo.formTeacherId);
    formTeacherName.textContent = formTeacher ? formTeacher.name : '—';

    const headings = ['Student', ...subjects.map((subject) => subject.name), 'Total', 'Average', 'Position', 'Grade'];
    headRow.innerHTML = headings.map((heading) => (
      `<th scope="col" class="px-3 py-3 ${heading === 'Student' ? 'sticky left-0 z-10 bg-bg' : ''}">${escapeHtml(heading)}</th>`
    )).join('');

    bodyRows.innerHTML = rows.map((row) => `
      <tr class="border-b border-border align-top">
        <th scope="row" data-student-id="${escapeHtml(row.student.id)}" class="sticky left-0 z-10 bg-card px-3 py-3 text-left text-sm font-medium text-text">
          <div>${escapeHtml(row.student.name)}</div>
          <div class="mt-0.5 text-[11px] font-normal text-muted">${escapeHtml(row.student.id)}</div>
        </th>
        ${row.subjectTotals.map((entry) => {
          const classes = ['px-3 py-3 text-sm text-text'];
          if (!entry.complete) {
            return `<td class="${classes.join(' ')}">Incomplete</td>`;
          }
          if (!engine.isPassed(entry.total, grading.passMark)) {
            classes.push('text-danger', 'font-semibold');
          }
          return `<td class="${classes.join(' ')}">${escapeHtml(formatNumber(entry.total, 0))}</td>`;
        }).join('')}
        <td class="px-3 py-3 text-sm font-semibold text-text">${row.total === null ? 'Incomplete' : escapeHtml(formatNumber(row.total, 0))}</td>
        <td class="px-3 py-3 text-sm font-semibold text-text">${row.average === null ? 'Incomplete' : escapeHtml(formatNumber(row.average))}</td>
        <td class="px-3 py-3 text-sm font-semibold text-text">${row.position === null || row.hasIncomplete ? '—' : escapeHtml(ordinal(row.position))}</td>
        <td class="px-3 py-3 text-sm font-semibold text-text">${escapeHtml(row.grade)}</td>
      </tr>
    `).join('');

    const completeRows = rows.filter((row) => !row.hasIncomplete && row.average !== null);
    const classStats = engine.getClassStats(
      completeRows.map((row) => row.average),
      grading.passMark
    );
    averageField.textContent = formatNumber(classStats.average);
    highestField.textContent = formatNumber(classStats.highest);
    lowestField.textContent = formatNumber(classStats.lowest);
    countField.textContent = String(students.length);
    passedAllField.textContent = String(rows.filter((row) => (
      row.subjectTotals.length > 0
      && row.subjectTotals.every((subject) => (
        subject.complete && engine.isPassed(subject.total, grading.passMark)
      ))
    )).length);

    subjectAverages.innerHTML = subjects.map((subject, index) => {
      const totals = rows
        .map((row) => row.subjectTotals[index])
        .filter((entry) => entry.complete)
        .map((entry) => entry.total);
      const average = engine.getClassStats(totals, grading.passMark).average;
      return `<tr class="border-t border-border">
        <td class="px-3 py-2 text-sm text-text">${escapeHtml(subject.name)}</td>
        <td class="px-3 py-2 text-right text-sm font-semibold text-text">${escapeHtml(formatNumber(average))}</td>
      </tr>`;
    }).join('');
  }

  function exportCsv() {
    if (!currentView) return;
    const { classInfo, subjects, rows } = currentView;
    const csvRows = [
      ['Student', 'Student ID', ...subjects.map((subject) => subject.name), 'Total', 'Average', 'Position', 'Grade'],
      ...rows.map((row) => [
        row.student.name,
        row.student.id,
        ...row.subjectTotals.map((entry) => entry.complete ? entry.total : 'Incomplete'),
        row.total === null ? 'Incomplete' : row.total,
        row.average === null ? 'Incomplete' : row.average,
        row.position === null || row.hasIncomplete ? '—' : ordinal(row.position),
        row.grade
      ])
    ];

    const csv = csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${classInfo.name.toLowerCase().replace(/\s+/g, '-')}-${sessionSelect.value}-${termSelect.value.toLowerCase().replace(/\s+/g, '-')}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function wireEvents() {
    sessionSelect.addEventListener('change', renderTable);
    termSelect.addEventListener('change', renderTable);
    classSelect.addEventListener('change', renderTable);
    printButton.addEventListener('click', () => window.print());
    exportButton.addEventListener('click', exportCsv);
    bodyRows.addEventListener('click', (event) => {
      const studentRow = event.target.closest('[data-student-id]');
      if (!studentRow) return;

      const url = new URL('./report-card.html', window.location.href);
      url.searchParams.set('studentId', studentRow.dataset.studentId);
      url.searchParams.set('session', sessionSelect.value);
      url.searchParams.set('term', termSelect.value);
      url.searchParams.set('demo', '1');
      window.location.href = url.href;
    });
  }

  function init() {
    if (!demoMode) {
      content.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }
    if (!data || !engine) {
      throw new Error('Broadsheet requires ResultsDemoData and ResultsEngine.');
    }

    buildClassOptions();
    wireEvents();
    renderTable();
    content.classList.remove('hidden');
    emptyState.classList.add('hidden');
  }

  init();
})();
