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

  const classes = [
    { id: 'JSS2A', name: 'JSS 2A', level: 'juniorSecondary', formTeacherId: 'TCH-202' },
    { id: 'SS1B', name: 'SS 1B', level: 'seniorSecondary', formTeacherId: 'TCH-203' }
  ];

  const subjects = {
    JSS2A: [
      { id: 'mathematics', name: 'Mathematics' },
      { id: 'english', name: 'English Language' },
      { id: 'basic-science', name: 'Basic Science' },
      { id: 'physics', name: 'Physics' },
      { id: 'civic-education', name: 'Civic Education' },
      { id: 'computer-studies', name: 'Computer Studies' }
    ],
    SS1B: [
      { id: 'mathematics', name: 'Mathematics' },
      { id: 'english', name: 'English Language' },
      { id: 'physics', name: 'Physics' }
    ]
  };

  const teachers = [
    {
      staffId: 'TCH-201',
      name: 'Grace Adebayo',
      assignments: [
        { classId: 'JSS2A', subjectId: 'mathematics' },
        { classId: 'JSS2A', subjectId: 'physics' },
        { classId: 'SS1B', subjectId: 'mathematics' },
        { classId: 'SS1B', subjectId: 'physics' }
      ]
    },
    {
      staffId: 'TCH-202',
      name: 'Ibrahim Musa',
      assignments: [
        { classId: 'JSS2A', subjectId: 'english' },
        { classId: 'JSS2A', subjectId: 'basic-science' }
      ]
    },
    {
      staffId: 'TCH-203',
      name: 'Sarah Musa',
      assignments: [
        { classId: 'SS1B', subjectId: 'english' }
      ]
    }
  ];

  const students = {
    JSS2A: [
      { id: 'STU-201', name: 'Aisha Bello' },
      { id: 'STU-202', name: 'Chinedu Okafor' },
      { id: 'STU-203', name: 'Fatima Yusuf' },
      { id: 'STU-204', name: 'Ibrahim Musa' },
      { id: 'STU-205', name: 'Kemi Adeyemi' },
      { id: 'STU-206', name: 'Ngozi Eze' },
      { id: 'STU-207', name: 'Tunde Bakare' },
      { id: 'STU-208', name: 'Zainab Sani' },
      { id: 'STU-209', name: 'David James' },
      { id: 'STU-210', name: 'Mary George' }
    ],
    SS1B: [
      { id: 'STU-301', name: 'Ada Nwosu' },
      { id: 'STU-302', name: 'Bola Akinyemi' },
      { id: 'STU-303', name: 'Daniel Obi' },
      { id: 'STU-304', name: 'Esther James' },
      { id: 'STU-305', name: 'Femi Lawal' },
      { id: 'STU-306', name: 'Hauwa Bello' },
      { id: 'STU-307', name: 'John Peter' },
      { id: 'STU-308', name: 'Sarah Musa' }
    ]
  };

  const scoreRecords = {
    '2026/2027|First|JSS2A|mathematics': {
      'STU-201': { CA1: 14, CA2: 14, Exam: 67 },
      'STU-202': { CA1: 13, CA2: 13, Exam: 64 },
      'STU-203': { CA1: 13, CA2: 13, Exam: 64 },
      'STU-204': { CA1: 5, CA2: 5, Exam: 25 },
      'STU-205': { CA1: 11, CA2: 12, Exam: 51 },
      'STU-206': { CA1: 9, CA2: 10, Exam: 49 },
      'STU-207': { CA1: 10, CA2: 11, Exam: 55 },
      'STU-208': { CA1: 12, CA2: 11, Exam: null },
      'STU-209': { CA1: 8, CA2: null, Exam: null },
      'STU-210': { CA1: null, CA2: null, Exam: null }
    }
  };

  const broadsheetTotals = {
    First: {
      english: [86, 80, 80, 62, 76, 71, 78, 66, 59, 48],
      'basic-science': [82, 78, 78, 56, 75, 70, 76, 63, 58, 50],
      physics: [80, 74, 74, 45, 73, 68, 76, 60, 54, 46],
      'civic-education': [90, 82, 82, 64, 80, 73, 79, 67, 61, 52],
      'computer-studies': [88, 80, 80, 58, 77, 70, 78, 65, 57, 49]
    },
    Second: {
      mathematics: [97, 91, 91, 72, 81, 75, 82, 70, 62, 54],
      english: [88, 82, 82, 68, 77, 73, 79, 66, 60, 51],
      'basic-science': [84, 79, 79, 64, 76, 71, 78, 65, 57, 49],
      physics: [82, 76, 76, 47, 75, 69, 77, 62, 55, 45],
      'civic-education': [91, 84, 84, 70, 82, 76, 81, 69, 63, 54],
      'computer-studies': [89, 82, 82, 65, 79, 73, 80, 67, 60, 52]
    },
    Third: {
      mathematics: [99, 93, 93, 78, 85, 79, 86, 74, 66, 58],
      english: [91, 85, 85, 72, 80, 76, 82, 70, 63, 54],
      'basic-science': [87, 82, 82, 69, 79, 75, 81, 68, 60, 52],
      physics: [85, 78, 78, 52, 79, 72, 81, 66, 59, 48],
      'civic-education': [94, 87, 87, 74, 85, 80, 84, 72, 66, 57],
      'computer-studies': [92, 85, 85, 70, 82, 77, 83, 71, 64, 55]
    }
  };

  Object.entries(broadsheetTotals).forEach(([term, subjectsForTerm]) => {
    Object.entries(subjectsForTerm).forEach(([subjectId, totals]) => {
      const key = `2026/2027|${term}|JSS2A|${subjectId}`;
      if (scoreRecords[key]) return;

      scoreRecords[key] = Object.fromEntries(students.JSS2A.map((student, index) => {
        const total = totals[index];
        const ca1 = Math.min(15, Math.floor(total / 6));
        const ca2 = Math.min(15, Math.floor(total / 6));
        return [student.id, { CA1: ca1, CA2: ca2, Exam: total - ca1 - ca2 }];
      }));
    });
  });

  const statuses = {};
  const scoreMetadata = {};

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
    classes,
    subjects,
    students,
    teachers,
    scoreRecords,
    statuses,
    scoreMetadata,
    getSettings(level) {
      return settings[level] ? clone(settings[level]) : null;
    },
    saveSettings(level, value) {
      if (!settings[level]) throw new Error(`Unknown grading level: ${level}`);
      settings[level] = clone(value);
      return clone(settings[level]);
    },
    copySettings(fromLevel, toLevel) {
      if (!settings[fromLevel] || !settings[toLevel]) {
        throw new Error('Cannot copy rules for an unknown grading level.');
      }
      settings[toLevel] = clone(settings[fromLevel]);
      return clone(settings[toLevel]);
    },
    getScoreKey(session, term, classId, subjectId) {
      return `${session}|${term}|${classId}|${subjectId}`;
    },
    getScores(key) {
      return clone(scoreRecords[key] || {});
    },
    saveScores(key, records) {
      scoreRecords[key] = clone(records);
      return clone(scoreRecords[key]);
    },
    getScoreMetadata(key) {
      return scoreMetadata[key] ? clone(scoreMetadata[key]) : null;
    },
    setScoreMetadata(key, metadata) {
      scoreMetadata[key] = clone(metadata);
      return clone(scoreMetadata[key]);
    },
    getStatus(key) {
      return statuses[key] || 'Draft';
    },
    setStatus(key, status) {
      if (!['Draft', 'Submitted', 'Published'].includes(status)) {
        throw new Error(`Unknown score status: ${status}`);
      }
      statuses[key] = status;
      return status;
    },
    resetScoreData() {
      for (const key of Object.keys(scoreRecords)) delete scoreRecords[key];
      scoreRecords['2026/2027|First|JSS2A|mathematics'] = clone(defaultMathematicsScores);
      for (const key of Object.keys(statuses)) delete statuses[key];
      for (const key of Object.keys(scoreMetadata)) delete scoreMetadata[key];
    }
  };

  const defaultMathematicsScores = clone(scoreRecords['2026/2027|First|JSS2A|mathematics']);
})();
