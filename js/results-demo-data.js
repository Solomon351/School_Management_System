// TEMPORARY: the server will store these settings and do the real calculations
(function () {
  'use strict';

  const templates = {
    simpleAF: [
      { from: 70, to: 100, grade: 'A', remark: 'Excellent' },
      { from: 60, to: 69, grade: 'B', remark: 'Very Good' },
      { from: 50, to: 59, grade: 'C', remark: 'Good' },
      { from: 45, to: 49, grade: 'D', remark: 'Fair' },
      { from: 40, to: 44, grade: 'E', remark: 'Pass' },
      { from: 0, to: 39, grade: 'F', remark: 'Fail' }
    ],
    waecA1F9: [
      { from: 75, to: 100, grade: 'A1', remark: 'Excellent' },
      { from: 70, to: 74, grade: 'B2', remark: 'Very Good' },
      { from: 65, to: 69, grade: 'B3', remark: 'Good' },
      { from: 60, to: 64, grade: 'C4', remark: 'Credit' },
      { from: 55, to: 59, grade: 'C5', remark: 'Credit' },
      { from: 50, to: 54, grade: 'C6', remark: 'Credit' },
      { from: 45, to: 49, grade: 'D7', remark: 'Pass' },
      { from: 40, to: 44, grade: 'E8', remark: 'Pass' },
      { from: 0, to: 39, grade: 'F9', remark: 'Fail' }
    ]
  };

  const settings = {
    primary: {
      scoreParts: [
        { name: 'CA1', maximumMarks: 15 },
        { name: 'CA2', maximumMarks: 15 },
        { name: 'Exam', maximumMarks: 70 }
      ],
      gradingScale: clone(templates.simpleAF),
      passMark: 40,
      yearlyPromotionMark: 40,
      thirdTermRule: 'yearly-average',
      reportCardOptions: {
        showClassPosition: true,
        showClassAverage: true,
        showSubjectPosition: false
      }
    },
    juniorSecondary: {
      scoreParts: [
        { name: 'CA1', maximumMarks: 15 },
        { name: 'CA2', maximumMarks: 15 },
        { name: 'Exam', maximumMarks: 70 }
      ],
      gradingScale: clone(templates.waecA1F9),
      passMark: 40,
      yearlyPromotionMark: 40,
      thirdTermRule: 'yearly-average',
      reportCardOptions: {
        showClassPosition: true,
        showClassAverage: true,
        showSubjectPosition: true
      }
    },
    seniorSecondary: {
      scoreParts: [
        { name: 'CA1', maximumMarks: 15 },
        { name: 'CA2', maximumMarks: 15 },
        { name: 'Exam', maximumMarks: 70 }
      ],
      gradingScale: clone(templates.waecA1F9),
      passMark: 40,
      yearlyPromotionMark: 40,
      thirdTermRule: 'yearly-average',
      reportCardOptions: {
        showClassPosition: true,
        showClassAverage: true,
        showSubjectPosition: true
      }
    }
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  window.ResultsDemoData = {
    levels: [
      { id: 'primary', label: 'Primary' },
      { id: 'juniorSecondary', label: 'Junior Secondary' },
      { id: 'seniorSecondary', label: 'Senior Secondary' }
    ],
    templates: clone(templates),
    settings,
    getSettings(level) {
      return settings[level] ? clone(settings[level]) : null;
    },
    saveSettings(level, value) {
      if (!settings[level]) {
        throw new Error(`Unknown grading level: ${level}`);
      }
      settings[level] = clone(value);
      return clone(settings[level]);
    },
    copySettings(fromLevel, toLevel) {
      if (!settings[fromLevel] || !settings[toLevel]) {
        throw new Error('Cannot copy rules for an unknown grading level.');
      }
      settings[toLevel] = clone(settings[fromLevel]);
      return clone(settings[toLevel]);
    }
  };
})();
