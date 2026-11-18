// TEMPORARY: the server will do the real calculations and store the comments
(function () {
  'use strict';

  const page = document.querySelector('[data-report-card-page]');
  if (!page) return;

  const data = window.ResultsDemoData;
  const engine = window.ResultsEngine;
  const params = new URLSearchParams(window.location.search);
  const demoMode = params.get('demo') === '1';
  let selectedStudentId = params.get('student') || '';
  let session = params.get('session') || '2026/2027';
  let selectedTerm = normalizeTerm(params.get('term') || 'First');
  let selectedClassId = null;

  const emptyState = document.getElementById('report-card-empty');
  const content = document.getElementById('report-card-content');
  const selectors = document.getElementById('report-card-selectors');
  const sessionSelect = document.getElementById('report-card-session-select');
  const termSelect = document.getElementById('report-card-term-select');
  const classSelect = document.getElementById('report-card-class-select');
  const studentSelect = document.getElementById('report-card-student-select');
  const printButton = document.getElementById('report-card-print');
  const previousButton = document.getElementById('report-card-prev');
  const nextButton = document.getElementById('report-card-next');

  const schoolName = document.getElementById('report-card-school-name');
  const sessionField = document.getElementById('report-card-session');
  const termField = document.getElementById('report-card-term');
  const studentName = document.getElementById('report-card-student-name');
  const studentIdField = document.getElementById('report-card-student-id');
  const classNameField = document.getElementById('report-card-class-name');
  const classSizeField = document.getElementById('report-card-class-size');
  const attendanceField = document.getElementById('report-card-attendance');
  const incompleteWarning = document.getElementById('report-card-incomplete-warning');
  const subjectRows = document.getElementById('report-card-subject-rows');
  const totalScoreField = document.getElementById('report-card-total-score');
  const averageField = document.getElementById('report-card-average');
  const positionWrap = document.getElementById('report-card-position-wrap');
  const positionField = document.getElementById('report-card-position');
  const classAverageWrap = document.getElementById('report-card-class-average-wrap');
  const classAverageField = document.getElementById('report-card-class-average');
  const passedField = document.getElementById('report-card-passed');
  const failedField = document.getElementById('report-card-failed');
  const gradingKey = document.getElementById('report-card-grading-key');
  const thirdTermBlock = document.getElementById('report-card-third-term');
  const termAveragesBody = document.getElementById('report-card-term-averages');
  const promotionField = document.getElementById('report-card-promotion');
  const formTeacherComment = document.getElementById('report-card-form-comment');
  const principalComment = document.getElementById('report-card-principal-comment');
  const formCommentPrint = document.getElementById('report-card-form-comment-print');
  const principalCommentPrint = document.getElementById('report-card-principal-comment-print');
  const formTeacherNameField = document.getElementById('report-card-form-teacher');
  const principalNameField = document.getElementById('report-card-principal-name');
  const reportDateField = document.getElementById('report-card-date');
  const nextTermDateField = document.getElementById('report-card-next-term');

  function normalizeTerm(value) {
    if (!value) return 'First';
    const normalized = String(value).trim();
    if (/^first$/i.test(normalized)) return 'First';
    if (/^second$/i.test(normalized)) return 'Second';
    if (/^third$/i.test(normalized)) return 'Third';
    return normalized.replace(/\s+Term$/i, '');
  }

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

  function getClassForStudent(studentId) {
    if (!data || !data.students) return null;
    for (const [classId, students] of Object.entries(data.students)) {
      const match = students.find((student) => student.id === studentId);
      if (match) {
        return {
          id: classId,
          name: (data.classes.find((entry) => entry.id === classId) || {}).name || classId,
          level: (data.classes.find((entry) => entry.id === classId) || {}).level || null,
          formTeacherId: (data.classes.find((entry) => entry.id === classId) || {}).formTeacherId || null,
          students,
          match
        };
      }
    }
    return null;
  }

  function getTeacherNameByAssignment(classId, subjectId) {
    if (!data || !data.teachers) return '—';
    const teacher = data.teachers.find((entry) => (entry.assignments || []).some((assignment) => (
      assignment.classId === classId && assignment.subjectId === subjectId
    )));
    return teacher ? teacher.name : '—';
  }

  function getStudentTermScores(classInfo, studentId, classSettings) {
    const subjects = data.subjects[classInfo.id] || [];
    return subjects.map((subject) => {
      const key = data.getScoreKey(session, selectedTerm, classInfo.id, subject.id);
      const records = data.getScores(key);
      const entry = records[studentId] || {};
      const result = engine.calculateTotal(classSettings.scoreParts, entry);
      const grade = result.complete ? engine.getGradeAndRemark(result.total, classSettings.gradingScale) : null;
      return {
        subject,
        scores: { ...entry },
        total: result.complete ? result.total : null,
        complete: result.complete,
        grade: grade ? grade.grade : '—',
        remark: grade ? grade.remark : '—',
        teacher: getTeacherNameByAssignment(classInfo.id, subject.id),
        subjectAverage: null,
        position: null
      };
    });
  }

  function getAllStudentClassTotals(classInfo, classSettings, termName) {
    const students = data.students[classInfo.id] || [];
    const subjects = data.subjects[classInfo.id] || [];
    return students.map((student) => {
      const totals = subjects.map((subject) => {
        const key = data.getScoreKey(session, termName, classInfo.id, subject.id);
        const records = data.getScores(key);
        const result = engine.calculateTotal(classSettings.scoreParts, records[student.id] || {});
        return result.complete ? result.total : null;
      }).filter((value) => value !== null && value !== undefined);
      return totals.length ? totals.reduce((sum, value) => sum + value, 0) / totals.length : null;
    });
  }

  function buildTermAverages(classInfo, studentId, classSettings) {
    const subjects = data.subjects[classInfo.id] || [];
    return ['First', 'Second', 'Third'].map((termName) => {
      const totals = subjects.map((subject) => {
        const key = data.getScoreKey(session, termName, classInfo.id, subject.id);
        const records = data.getScores(key);
        const result = engine.calculateTotal(classSettings.scoreParts, records[studentId] || {});
        return result.complete ? result.total : null;
      }).filter((value) => value !== null && value !== undefined);
      return {
        term: termName,
        average: totals.length ? totals.reduce((sum, value) => sum + value, 0) / totals.length : null
      };
    });
  }

  function showEmptyState(message) {
    if (emptyState) {
      emptyState.textContent = message;
      emptyState.classList.remove('hidden');
    }
    if (content) content.classList.add('hidden');
  }

  function setSelectOptions(select, options, selectedValue) {
    select.replaceChildren();
    options.forEach((option) => {
      const element = document.createElement('option');
      element.value = option.value;
      element.textContent = option.label;
      select.appendChild(element);
    });
    select.value = selectedValue;
  }

  function populateStudentOptions(classId, preferredStudentId) {
    const students = (data.students && data.students[classId]) || [];
    const options = [{ value: '', label: 'Select student' }].concat(students.map((student) => ({
      value: student.id,
      label: `${student.name} (${student.id})`
    })));
    const selected = students.some((student) => student.id === preferredStudentId)
      ? preferredStudentId
      : '';
    setSelectOptions(studentSelect, options, selected);
    return students;
  }

  function updateAddress() {
    const url = new URL(window.location.href);
    if (selectedStudentId) {
      url.searchParams.set('student', selectedStudentId);
    } else {
      url.searchParams.delete('student');
    }
    url.searchParams.set('session', session);
    url.searchParams.set('term', selectedTerm);
    window.history.replaceState(null, '', url.href);
  }

  function updateNavigation() {
    const classInfo = selectedStudentId ? getClassForStudent(selectedStudentId) : null;
    const students = classInfo ? data.students[classInfo.id] || [] : [];
    const currentIndex = students.findIndex((student) => student.id === selectedStudentId);
    previousButton.disabled = currentIndex <= 0;
    nextButton.disabled = currentIndex === -1 || currentIndex >= students.length - 1;
  }

  function renderSelection(updateUrl) {
    if (updateUrl) updateAddress();
    studentSelect.value = selectedStudentId || '';
    updateNavigation();
    if (selectedStudentId) {
      populatePage();
    } else {
      showEmptyState('No student result is available. Add ?demo=1 to view a sample report card.');
    }
  }

  function setupSelectors() {
    const knownStudentClass = selectedStudentId ? getClassForStudent(selectedStudentId) : null;
    const defaultClass = data.classes.find((entry) => entry.id === 'JSS2A') || data.classes[0];
    selectedClassId = knownStudentClass ? knownStudentClass.id : (defaultClass ? defaultClass.id : '');

    const sessions = Object.keys(data.scoreRecords || {})
      .map((key) => key.split('|')[0])
      .filter((value, index, values) => value && values.indexOf(value) === index);
    if (!sessions.includes('2026/2027')) sessions.unshift('2026/2027');
    if (session && !sessions.includes(session)) sessions.push(session);
    setSelectOptions(sessionSelect, sessions.map((value) => ({ value, label: value })), session);

    const terms = ['First', 'Second', 'Third'];
    if (selectedTerm && !terms.includes(selectedTerm)) terms.push(selectedTerm);
    setSelectOptions(termSelect, terms.map((value) => ({ value, label: `${value} Term` })), selectedTerm);
    setSelectOptions(classSelect, data.classes.map((entry) => ({
      value: entry.id,
      label: entry.name
    })), selectedClassId);

    const classStudents = populateStudentOptions(selectedClassId, selectedStudentId);
    if (!selectedStudentId && demoMode && classStudents.length) {
      selectedStudentId = classStudents[0].id;
      studentSelect.value = selectedStudentId;
    }

    selectors.classList.toggle('hidden', !demoMode && !selectedStudentId);

    sessionSelect.addEventListener('change', () => {
      session = sessionSelect.value;
      renderSelection(true);
    });
    termSelect.addEventListener('change', () => {
      selectedTerm = normalizeTerm(termSelect.value);
      renderSelection(true);
    });
    classSelect.addEventListener('change', () => {
      selectedClassId = classSelect.value;
      const students = populateStudentOptions(selectedClassId, '');
      selectedStudentId = students.length ? students[0].id : '';
      renderSelection(true);
    });
    studentSelect.addEventListener('change', () => {
      selectedStudentId = studentSelect.value;
      renderSelection(true);
    });
  }

  function applyCommentVisibility() {
    if (!demoMode) {
      formTeacherComment.classList.add('hidden');
      principalComment.classList.add('hidden');
      formCommentPrint.textContent = formTeacherComment.value || '—';
      principalCommentPrint.textContent = principalComment.value || '—';
      return;
    }

    formTeacherComment.classList.remove('hidden');
    principalComment.classList.remove('hidden');
    formCommentPrint.textContent = formTeacherComment.value || '—';
    principalCommentPrint.textContent = principalComment.value || '—';
  }

  function populatePage() {
    if (!data || !engine || !selectedStudentId) {
      showEmptyState('No student result is available. Add ?demo=1 to view a sample report card.');
      return;
    }

    const classInfo = getClassForStudent(selectedStudentId);
    if (!classInfo) {
      showEmptyState('Student not found in the sample data');
      return;
    }

    const classSettings = data.getSettings(classInfo.level);
    if (!classSettings) {
      showEmptyState('No grading settings are available for this class.');
      return;
    }

    const classStudents = data.students[classInfo.id] || [];
    const student = classStudents.find((entry) => entry.id === selectedStudentId) || classInfo.match;
    if (!student) {
      showEmptyState('Student not found in the sample data');
      return;
    }

    const classTeacher = data.teachers.find((teacher) => teacher.staffId === classInfo.formTeacherId) || null;
    const attendance = data.attendance && data.attendance[student.id] ? data.attendance[student.id] : { present: 0, schoolOpened: 0 };
    const schoolNameValue = data.schoolName || 'Educanize Academy';
    const principalName = data.principalName || 'Dr. A. Obi';
    const nextTermValue = data.nextTermDate || 'Monday, 6 January 2027';
    const formCommentDefault = (data.comments && data.comments.formTeacher) || 'This student is making steady progress and should continue to revise daily to improve confidence and consistency.';
    const principalCommentDefault = (data.comments && data.comments.principal) || 'Keep up the excellent effort this term; consistent study and a positive attitude will strengthen future performance.';

    emptyState.classList.add('hidden');
    content.classList.remove('hidden');
    schoolName.textContent = schoolNameValue;
    sessionField.textContent = session;
    termField.textContent = `${selectedTerm} Term`;
    studentName.textContent = student.name;
    studentIdField.textContent = student.id;
    classNameField.textContent = classInfo.name;
    classSizeField.textContent = String(classStudents.length);
    attendanceField.textContent = `${attendance.present} / ${attendance.schoolOpened}`;
    formTeacherNameField.textContent = classTeacher ? classTeacher.name : '—';
    principalNameField.textContent = principalName;
    reportDateField.textContent = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
    nextTermDateField.textContent = nextTermValue;

    if (demoMode) {
      formTeacherComment.value = formCommentDefault;
      principalComment.value = principalCommentDefault;
      formTeacherComment.classList.remove('hidden');
      principalComment.classList.remove('hidden');
    } else {
      formTeacherComment.value = formCommentDefault;
      principalComment.value = principalCommentDefault;
      formTeacherComment.classList.add('hidden');
      principalComment.classList.add('hidden');
    }

    applyCommentVisibility();

    const subjects = data.subjects[classInfo.id] || [];
    const subjectRowsForStudent = subjects.map((subject) => {
      const key = data.getScoreKey(session, selectedTerm, classInfo.id, subject.id);
      const records = data.getScores(key);
      const scores = records[student.id] || {};
      const result = engine.calculateTotal(classSettings.scoreParts, scores);
      const gradeInfo = result.complete ? engine.getGradeAndRemark(result.total, classSettings.gradingScale) : null;
      return {
        subject,
        scores,
        total: result.complete ? result.total : null,
        complete: result.complete,
        grade: gradeInfo ? gradeInfo.grade : '—',
        remark: gradeInfo ? gradeInfo.remark : '—',
        teacher: getTeacherNameByAssignment(classInfo.id, subject.id),
        classAverage: null,
        position: null
      };
    });

    const completedCount = subjectRowsForStudent.filter((entry) => entry.complete).length;
    const missingSubjects = subjectRowsForStudent.filter((entry) => !entry.complete).map((entry) => entry.subject.name);
    if (missingSubjects.length) {
      incompleteWarning.textContent = `Results incomplete: ${missingSubjects.join(', ')} has not been entered`;
      incompleteWarning.classList.remove('hidden');
    } else {
      incompleteWarning.classList.add('hidden');
    }

    const classSubjectAverages = subjects.map((subject) => {
      const subjectTotals = classStudents.map((currentStudent) => {
        const key = data.getScoreKey(session, selectedTerm, classInfo.id, subject.id);
        const records = data.getScores(key);
        const result = engine.calculateTotal(classSettings.scoreParts, records[currentStudent.id] || {});
        return result.complete ? result.total : null;
      }).filter((value) => value !== null && value !== undefined);
      const stats = engine.getClassStats(subjectTotals, classSettings.passMark);
      return { subject, average: stats.average };
    });

    const subjectPositions = subjects.map((subject) => {
      const values = classStudents.map((currentStudent) => {
        const key = data.getScoreKey(session, selectedTerm, classInfo.id, subject.id);
        const records = data.getScores(key);
        const result = engine.calculateTotal(classSettings.scoreParts, records[currentStudent.id] || {});
        return result.complete ? result.total : null;
      });
      const positions = engine.getPositions(values);
      const studentIndex = classStudents.findIndex((item) => item.id === student.id);
      return {
        subjectId: subject.id,
        position: positions[studentIndex] || null
      };
    });

    subjectRows.innerHTML = subjectRowsForStudent.map((entry) => {
      const classAverage = classSubjectAverages.find((item) => item.subject.id === entry.subject.id)?.average ?? null;
      const position = subjectPositions.find((item) => item.subjectId === entry.subject.id)?.position ?? null;
      const textClass = entry.complete && !engine.isPassed(entry.total, classSettings.passMark) ? 'text-danger font-semibold' : 'text-text';
      const positionCell = classSettings.reportCardOptions.showSubjectPosition && position !== null
        ? `${escapeHtml(position)}${ordinal(position)}`
        : '—';
      return `
        <tr class="border-b border-border align-top">
          <td class="px-3 py-3 text-sm font-medium text-text">${escapeHtml(entry.subject.name)}</td>
          <td class="px-3 py-3 text-sm ${textClass}">${entry.complete && entry.scores.CA1 !== null && entry.scores.CA1 !== undefined ? escapeHtml(formatNumber(entry.scores.CA1, 0)) : '—'}</td>
          <td class="px-3 py-3 text-sm ${textClass}">${entry.complete && entry.scores.CA2 !== null && entry.scores.CA2 !== undefined ? escapeHtml(formatNumber(entry.scores.CA2, 0)) : '—'}</td>
          <td class="px-3 py-3 text-sm ${textClass}">${entry.complete && entry.scores.Exam !== null && entry.scores.Exam !== undefined ? escapeHtml(formatNumber(entry.scores.Exam, 0)) : '—'}</td>
          <td class="px-3 py-3 text-sm font-semibold ${textClass}">${entry.complete ? escapeHtml(formatNumber(entry.total, 0)) : 'Incomplete'}</td>
          <td class="px-3 py-3 text-sm font-semibold ${textClass}">${entry.complete ? escapeHtml(entry.grade) : '—'}</td>
          <td class="px-3 py-3 text-sm ${textClass}">${entry.complete ? escapeHtml(entry.remark) : '—'}</td>
          <td class="px-3 py-3 text-sm text-text">${classAverage === null ? '—' : escapeHtml(formatNumber(classAverage, 1))}</td>
          <td class="px-3 py-3 text-sm text-text">${positionCell}</td>
          <td class="px-3 py-3 text-sm text-text">${escapeHtml(entry.teacher)}</td>
        </tr>
      `;
    }).join('');

    const classTotals = classStudents.map((currentStudent) => {
      const values = subjects.map((subject) => {
        const key = data.getScoreKey(session, selectedTerm, classInfo.id, subject.id);
        const records = data.getScores(key);
        const result = engine.calculateTotal(classSettings.scoreParts, records[currentStudent.id] || {});
        return result.complete ? result.total : null;
      }).filter((value) => value !== null && value !== undefined);
      return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
    });
    const studentClassTotal = classTotals[classStudents.findIndex((item) => item.id === student.id)] ?? null;
    const subjectPassed = subjectRowsForStudent.filter((entry) => entry.complete && engine.isPassed(entry.total, classSettings.passMark)).length;
    const subjectFailed = subjectRowsForStudent.filter((entry) => entry.complete && !engine.isPassed(entry.total, classSettings.passMark)).length;
    const classAverage = classTotals.filter((value) => value !== null).length ? classTotals.filter((value) => value !== null).reduce((sum, value) => sum + value, 0) / classTotals.filter((value) => value !== null).length : null;
    const classPosition = engine.getPositions(classTotals);
    const studentPosition = classPosition[classStudents.findIndex((item) => item.id === student.id)] || null;

    totalScoreField.textContent = studentClassTotal === null ? '—' : formatNumber(studentClassTotal, 0);
    if (missingSubjects.length) {
      averageField.textContent = '—';
      positionField.textContent = '—';
      classAverageField.textContent = '—';
      positionWrap.classList.add('hidden');
      classAverageWrap.classList.add('hidden');
    } else {
      averageField.textContent = studentClassTotal === null ? '—' : formatNumber(studentClassTotal / Math.max(subjects.length - missingSubjects.length, 1), 1);
      positionWrap.classList.toggle('hidden', !classSettings.reportCardOptions.showClassPosition);
      classAverageWrap.classList.toggle('hidden', !classSettings.reportCardOptions.showClassAverage);
      positionField.textContent = classSettings.reportCardOptions.showClassPosition && studentPosition ? `${ordinal(studentPosition)} of ${classStudents.length}` : '—';
      classAverageField.textContent = classSettings.reportCardOptions.showClassAverage && classAverage !== null ? formatNumber(classAverage, 1) : '—';
    }

    passedField.textContent = String(subjectPassed);
    failedField.textContent = String(subjectFailed);

    const gradingRows = classSettings.gradingScale.map((scale) => `
      <tr class="border-b border-border">
        <td class="px-2 py-2 text-sm font-semibold text-text">${escapeHtml(scale.grade)}</td>
        <td class="px-2 py-2 text-right text-sm text-text">${escapeHtml(`${scale.from}-${scale.to}`)}</td>
        <td class="px-2 py-2 text-right text-sm text-text">${escapeHtml(scale.remark)}</td>
      </tr>
    `).join('');
    gradingKey.innerHTML = gradingRows;

    const termAverages = buildTermAverages(classInfo, student.id, classSettings);
    const nonNullAverages = termAverages.filter((entry) => entry.average !== null);
    const yearlyAverage = nonNullAverages.length
      ? (classSettings.thirdTermRule === 'yearly-average'
        ? nonNullAverages.reduce((sum, entry) => sum + entry.average, 0) / nonNullAverages.length
        : termAverages[2]?.average ?? null)
      : null;

    if (selectedTerm === 'Third') {
      thirdTermBlock.classList.remove('hidden');
      termAveragesBody.innerHTML = termAverages.map((entry) => `
        <tr class="border-b border-border">
          <td class="px-2 py-2 text-sm text-text">${escapeHtml(entry.term)} Term</td>
          <td class="px-2 py-2 text-right text-sm font-semibold text-text">${entry.average === null ? '—' : escapeHtml(formatNumber(entry.average, 1))}</td>
        </tr>
      `).join('');
      const finalAverage = yearlyAverage === null ? '—' : formatNumber(yearlyAverage, 1);
      const promotionRecommended = yearlyAverage !== null && yearlyAverage >= Number(classSettings.yearlyPromotionMark || classSettings.promoteIfYearlyAverage || 0);
      promotionField.textContent = `${promotionRecommended ? 'Promotion: Recommended' : 'Promotion: Not recommended'} | Yearly average: ${finalAverage}`;
    } else {
      thirdTermBlock.classList.add('hidden');
    }

    if (demoMode) {
      formTeacherComment.value = formCommentDefault;
      principalComment.value = principalCommentDefault;
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
  }

  function navigateStudent(direction) {
    const students = (data.students && data.students[selectedClassId]) || [];
    const currentIndex = students.findIndex((student) => student.id === selectedStudentId);
    const nextIndex = Math.min(students.length - 1, Math.max(0, currentIndex + direction));
    const nextStudent = students[nextIndex];
    if (!nextStudent) return;
    selectedStudentId = nextStudent.id;
    studentSelect.value = selectedStudentId;
    renderSelection(true);
  }

  function initialize() {
    if (!data || !engine) {
      showEmptyState('No student result is available. Add ?demo=1 to view a sample report card.');
      return;
    }

    setupSelectors();
    previousButton.addEventListener('click', () => navigateStudent(-1));
    nextButton.addEventListener('click', () => navigateStudent(1));
    formTeacherComment.addEventListener('input', () => {
      formCommentPrint.textContent = formTeacherComment.value || '—';
    });
    principalComment.addEventListener('input', () => {
      principalCommentPrint.textContent = principalComment.value || '—';
    });
    printButton.addEventListener('click', () => window.print());
    renderSelection(false);
  }

  initialize();
})();
