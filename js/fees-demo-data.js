// TEMPORARY: the server will work out balances, arrears and status
(function () {
  'use strict';

  const sessions = ['2023/2024', '2024/2025', '2025/2026', '2026/2027'];
  const terms = ['First', 'Second', 'Third'];

  const defaultStudents = [
    {
      id: 'STU-001',
      name: 'James Okoro',
      className: 'SS3A',
      bills: [
        { session: '2023/2024', term: 'First', amountDue: 65000, amountPaid: 65000, dueDate: '2023-12-15', method: 'cash' },
        { session: '2024/2025', term: 'Second', amountDue: 70000, amountPaid: 70000, dueDate: '2024-06-15', method: 'bank' },
        { session: '2025/2026', term: 'First', amountDue: 82000, amountPaid: 82000, dueDate: '2025-12-15', method: 'cash' },
        { session: '2026/2027', term: 'First', amountDue: 85000, amountPaid: 85000, dueDate: '2026-12-15', method: 'pos' }
      ]
    },
    {
      id: 'STU-002',
      name: 'Mary Johnson',
      className: 'SS1A',
      bills: [
        { session: '2023/2024', term: 'First', amountDue: 90000, amountPaid: 90000, dueDate: '2023-12-15', method: 'cash' },
        { session: '2024/2025', term: 'Second', amountDue: 95000, amountPaid: 95000, dueDate: '2024-06-15', method: 'cash' },
        { session: '2025/2026', term: 'First', amountDue: 100000, amountPaid: 100000, dueDate: '2025-12-15', method: 'bank' },
        { session: '2026/2027', term: 'First', amountDue: 120000, amountPaid: 45000, dueDate: '2026-12-15', method: 'transfer' }
      ]
    },
    {
      id: 'STU-003',
      name: 'Amina Bello',
      className: 'JSS1A',
      bills: [
        { session: '2023/2024', term: 'First', amountDue: 60000, amountPaid: 60000, dueDate: '2023-12-15', method: 'cash' },
        { session: '2024/2025', term: 'Second', amountDue: 65000, amountPaid: 65000, dueDate: '2024-06-15', method: 'bank' },
        { session: '2025/2026', term: 'First', amountDue: 70000, amountPaid: 70000, dueDate: '2025-12-15', method: 'card' },
        { session: '2026/2027', term: 'First', amountDue: 90000, amountPaid: 30000, dueDate: '2026-12-15', method: 'card' }
      ]
    },
    {
      id: 'STU-004',
      name: 'Tunde Ade',
      className: 'SS2C',
      bills: [
        { session: '2023/2024', term: 'First', amountDue: 70000, amountPaid: 70000, dueDate: '2023-12-15', method: 'bank' },
        { session: '2024/2025', term: 'Second', amountDue: 75000, amountPaid: 75000, dueDate: '2024-06-15', method: 'cash' },
        { session: '2025/2026', term: 'First', amountDue: 100000, amountPaid: 0, dueDate: '2025-12-15', method: 'transfer' },
        { session: '2026/2027', term: 'First', amountDue: 100000, amountPaid: 20000, dueDate: '2026-12-15', method: 'bank' }
      ]
    },
    {
      id: 'STU-005',
      name: 'Grace Eze',
      className: 'SS2C',
      bills: [
        { session: '2023/2024', term: 'First', amountDue: 48000, amountPaid: 48000, dueDate: '2023-12-15', method: 'card' },
        { session: '2024/2025', term: 'Second', amountDue: 50000, amountPaid: 50000, dueDate: '2024-06-15', method: 'cash' },
        { session: '2025/2026', term: 'First', amountDue: 35000, amountPaid: 35000, dueDate: '2025-12-15', method: 'pos' },
        { session: '2026/2027', term: 'First', amountDue: 35000, amountPaid: 35000, dueDate: '2026-12-15', method: 'transfer' }
      ]
    },
    {
      id: 'STU-006',
      name: 'David Brown',
      className: 'SS1A',
      bills: [
        { session: '2023/2024', term: 'First', amountDue: 50000, amountPaid: 50000, dueDate: '2023-12-15', method: 'bank' },
        { session: '2024/2025', term: 'Second', amountDue: 52000, amountPaid: 52000, dueDate: '2024-06-15', method: 'card' },
        { session: '2025/2026', term: 'First', amountDue: 48000, amountPaid: 48000, dueDate: '2025-12-15', method: 'cash' },
        { session: '2026/2027', term: 'First', amountDue: 50000, amountPaid: 50000, dueDate: '2026-12-15', method: 'pos' }
      ]
    },
    {
      id: 'STU-007',
      name: 'Chioma Okafor',
      className: 'JSS2B',
      bills: [
        { session: '2023/2024', term: 'First', amountDue: 70000, amountPaid: 0, dueDate: '2023-12-15', method: 'bank' },
        { session: '2024/2025', term: 'First', amountDue: 75000, amountPaid: 0, dueDate: '2024-12-15', method: 'transfer' },
        { session: '2025/2026', term: 'First', amountDue: 80000, amountPaid: 0, dueDate: '2025-12-15', method: 'cash' },
        { session: '2026/2027', term: 'First', amountDue: 90000, amountPaid: 0, dueDate: '2026-12-15', method: 'bank' }
      ]
    },
    {
      id: 'STU-008',
      name: 'Emeka Nnamdi',
      className: 'JSS3B',
      bills: [
        { session: '2023/2024', term: 'First', amountDue: 55000, amountPaid: 55000, dueDate: '2023-12-15', method: 'cash' },
        { session: '2024/2025', term: 'Second', amountDue: 60000, amountPaid: 60000, dueDate: '2024-06-15', method: 'card' },
        { session: '2025/2026', term: 'First', amountDue: 62000, amountPaid: 62000, dueDate: '2025-12-15', method: 'pos' },
        { session: '2026/2027', term: 'First', amountDue: 65000, amountPaid: 25000, dueDate: '2026-12-15', method: 'ussd' }
      ]
    }
  ];

  const defaultPayments = [
    { id: 'RC-101', studentId: 'STU-001', student: 'James Okoro', className: 'SS3A', amount: 25000, method: 'card', session: '2026/2027', term: 'First', dueDate: '2026-12-15', balanceRemaining: 0, date: '2026-10-25' },
    { id: 'RC-102', studentId: 'STU-002', student: 'Mary Johnson', className: 'SS1A', amount: 45000, method: 'transfer', session: '2026/2027', term: 'First', dueDate: '2026-12-15', balanceRemaining: 75000, date: '2026-10-26' },
    { id: 'RC-103', studentId: 'STU-003', student: 'Amina Bello', className: 'JSS1A', amount: 30000, method: 'card', session: '2026/2027', term: 'First', dueDate: '2026-12-15', balanceRemaining: 60000, date: '2026-10-27' },
    { id: 'RC-104', studentId: 'STU-004', student: 'Tunde Ade', className: 'SS2C', amount: 20000, method: 'cash', session: '2026/2027', term: 'First', dueDate: '2026-10-20', balanceRemaining: 80000, date: '2026-10-20' },
    { id: 'RC-105', studentId: 'STU-005', student: 'Grace Eze', className: 'SS2C', amount: 35000, method: 'transfer', session: '2026/2027', term: 'First', dueDate: '2026-12-15', balanceRemaining: 0, date: '2026-10-28' },
    { id: 'RC-106', studentId: 'STU-006', student: 'David Brown', className: 'SS1A', amount: 50000, method: 'pos', session: '2026/2027', term: 'First', dueDate: '2026-12-15', balanceRemaining: 0, date: '2026-10-24' },
    { id: 'RC-107', studentId: 'STU-007', student: 'Chioma Okafor', className: 'JSS2B', amount: 0, method: 'bank', session: '2026/2027', term: 'First', dueDate: '2026-12-15', balanceRemaining: 90000, date: '' },
    { id: 'RC-108', studentId: 'STU-008', student: 'Emeka Nnamdi', className: 'JSS3B', amount: 25000, method: 'ussd', session: '2026/2027', term: 'First', dueDate: '2026-12-15', balanceRemaining: 40000, date: '2026-10-23' },
    { id: 'RC-109', studentId: 'STU-001', student: 'James Okoro', className: 'SS3A', amount: 18000, method: 'card', session: '2025/2026', term: 'Second', dueDate: '2026-05-30', balanceRemaining: 0, date: '2026-05-20' }
  ];

  const state = {
    students: clone(defaultStudents),
    payments: clone(defaultPayments)
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatMoney(value) {
    return '₦' + Number(value || 0).toLocaleString('en-NG');
  }

  function getStudentById(studentId) {
    const student = state.students.find((entry) => entry.id === studentId);
    return student ? clone(student) : null;
  }

  function getStudents() {
    return clone(state.students);
  }

  function getBillStatus(bill) {
    if (!bill) return 'unpaid';
    const balance = Math.max(bill.amountDue - bill.amountPaid, 0);
    if (balance === 0) return 'paid';
    if (bill.dueDate && bill.dueDate < todayIso()) return 'overdue';
    if (bill.amountPaid > 0) return 'partial';
    return 'unpaid';
  }

  function getStudentSummary(student, session = '2026/2027', term = 'First') {
    const currentBill = student.bills.find((bill) => bill.session === session && bill.term === term) || {
      session,
      term,
      amountDue: 0,
      amountPaid: 0,
      dueDate: '',
      method: 'cash'
    };

    const currentBalance = Math.max(currentBill.amountDue - currentBill.amountPaid, 0);
    const arrears = student.bills
      .filter((bill) => !(bill.session === session && bill.term === term))
      .reduce((sum, bill) => sum + Math.max(bill.amountDue - bill.amountPaid, 0), 0);
    const totalOwed = currentBalance + arrears;

    const unpaidBills = student.bills
      .filter((bill) => Math.max(bill.amountDue - bill.amountPaid, 0) > 0)
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

    return {
      studentId: student.id,
      name: student.name,
      className: student.className,
      currentBill,
      currentBalance,
      arrears,
      totalOwed,
      oldestUnpaid: unpaidBills[0] ? `${unpaidBills[0].session} ${unpaidBills[0].term} Term` : null,
      status: getBillStatus(currentBill)
    };
  }

  function getEarlierArrears(studentId, session = '2026/2027', term = 'First') {
    const student = getStudentById(studentId);
    if (!student) return 0;
    return student.bills
      .filter((bill) => !(bill.session === session && bill.term === term))
      .reduce((sum, bill) => sum + Math.max(bill.amountDue - bill.amountPaid, 0), 0);
  }

  function getOutstandingRows(session = '2026/2027', term = 'First') {
    return state.students
      .map((student) => getStudentSummary(student, session, term))
      .filter((summary) => summary.totalOwed > 0)
      .map((summary) => ({
        studentId: summary.studentId,
        name: summary.name,
        className: summary.className,
        arrears: summary.arrears,
        currentBalance: summary.currentBalance,
        totalOwed: summary.totalOwed,
        oldestUnpaid: summary.oldestUnpaid || '—'
      }))
      .sort((a, b) => b.totalOwed - a.totalOwed);
  }

  function getTransactions(session = 'all', term = 'all') {
    const selectedSession = session === 'all' ? null : session;
    const selectedTerm = term === 'all' ? null : term;

    return state.payments
      .filter((payment) => {
        const sessionMatches = !selectedSession || payment.session === selectedSession;
        const termMatches = !selectedTerm || payment.term === selectedTerm;
        return sessionMatches && termMatches;
      })
      .sort((a, b) => {
        const sessionOrder = sessions.indexOf(a.session) - sessions.indexOf(b.session);
        if (sessionOrder !== 0) return sessionOrder;
        return terms.indexOf(a.term) - terms.indexOf(b.term);
      });
  }

  function getPaymentById(receiptId) {
    return clone(state.payments.find((entry) => entry.id === receiptId)) || null;
  }

  function getStudentStatement(studentId) {
    const student = getStudentById(studentId);
    if (!student) return [];

    return student.bills
      .slice()
      .sort((a, b) => {
        const sessionOrder = sessions.indexOf(a.session) - sessions.indexOf(b.session);
        if (sessionOrder !== 0) return sessionOrder;
        return terms.indexOf(a.term) - terms.indexOf(b.term);
      })
      .map((bill) => ({
        ...bill,
        balance: Math.max(bill.amountDue - bill.amountPaid, 0),
        status: getBillStatus(bill)
      }));
  }

  function createPayment(studentId, session, term, amount, method, paymentDate, note) {
    const student = state.students.find((entry) => entry.id === studentId);
    if (!student) return null;

    const bill = student.bills.find((entry) => entry.session === session && entry.term === term) || {
      session,
      term,
      amountDue: 0,
      amountPaid: 0,
      dueDate: paymentDate || todayIso(),
      method: method || 'cash'
    };

    const paymentAmount = Number(amount || 0);
    const nextPaidTotal = Number(bill.amountPaid || 0) + paymentAmount;
    bill.amountPaid = Math.min(Number(bill.amountDue || 0), nextPaidTotal);
    bill.method = method || bill.method || 'cash';
    bill.dueDate = bill.dueDate || paymentDate || todayIso();

    const payment = {
      id: `RC-${Date.now()}`,
      studentId: student.id,
      student: student.name,
      className: student.className,
      session,
      term,
      amount: paymentAmount,
      method: method || bill.method || 'cash',
      dueDate: bill.dueDate,
      balanceRemaining: Math.max(Number(bill.amountDue || 0) - Number(bill.amountPaid || 0), 0),
      date: paymentDate || todayIso(),
      note: note || ''
    };

    state.payments.unshift(payment);
    return {
      payment,
      summary: getStudentSummary(student, session, term)
    };
  }

  function resetDemoState() {
    state.students = clone(defaultStudents);
    state.payments = clone(defaultPayments);
  }

  window.FeesDemoData = {
    sessions,
    terms,
    formatMoney,
    getStudents,
    getStudentById,
    getStudentSummary,
    getEarlierArrears,
    getOutstandingRows,
    getTransactions,
    getPaymentById,
    getStudentStatement,
    getBillStatus,
    createPayment,
    resetDemoState,
    currentState: state
  };
})();
