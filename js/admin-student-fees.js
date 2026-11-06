(function () {
  'use strict';

  const loadingEl = document.getElementById('student-fees-loading');
  const emptyEl = document.getElementById('student-fees-empty');
  const contentEl = document.getElementById('student-fees-content');
  const printButton = document.getElementById('print-button');
  const backToFeesLink = document.getElementById('back-to-fees');
  const collectFeesBtn = document.getElementById('collect-fees-btn');
  const studentNameEl = document.getElementById('student-name');
  const studentIdEl = document.getElementById('student-id');
  const studentClassEl = document.getElementById('student-class');
  const summaryTotalOwedEl = document.getElementById('summary-total-owed');
  const summaryArrearsEl = document.getElementById('summary-arrears');
  const summaryThisTermEl = document.getElementById('summary-this-term');
  const tableRowsEl = document.getElementById('statement-rows');
  const tableTotalsEl = document.getElementById('statement-totals');

  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('studentId');
  const demoMode = urlParams.get('demo') === '1';

  function formatMoney(value) {
    return '₦' + Number(value || 0).toLocaleString('en-NG');
  }

  function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function getStatusBadge(status) {
    const classes = {
      paid: 'bg-success/10 text-success',
      unpaid: 'bg-warning/10 text-warning',
      partial: 'bg-warning/10 text-warning',
      overdue: 'bg-danger/10 text-danger'
    };
    const labels = {
      paid: 'Paid',
      unpaid: 'Unpaid',
      partial: 'Partial',
      overdue: 'Overdue'
    };
    const key = status || 'unpaid';
    return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${classes[key] || classes.unpaid}">${labels[key] || 'Unpaid'}</span>`;
  }

  function renderStatement(student) {
    const currentTerm = '2026/2027';
    const currentTermSummary = window.FeesDemoData.getStudentSummary(student, currentTerm, 'First');
    const statement = window.FeesDemoData.getStudentStatement(student.id);
    const totalOwed = statement.reduce((sum, bill) => sum + Number(bill.amountDue || 0), 0);
    const totalPaid = statement.reduce((sum, bill) => sum + Number(bill.amountPaid || 0), 0);
    const arrears = statement.filter((bill) => !(bill.session === currentTerm && bill.term === 'First')).reduce((sum, bill) => sum + Math.max(Number(bill.amountDue || 0) - Number(bill.amountPaid || 0), 0), 0);
    const thisTermBalance = Math.max(Number(currentTermSummary.currentBill.amountDue || 0) - Number(currentTermSummary.currentBill.amountPaid || 0), 0);

    studentNameEl.textContent = student.name;
    studentIdEl.textContent = student.id;
    studentClassEl.textContent = student.className;
    summaryTotalOwedEl.textContent = formatMoney(currentTermSummary.totalOwed || 0);
    summaryArrearsEl.textContent = formatMoney(arrears);
    summaryThisTermEl.textContent = formatMoney(thisTermBalance);

    if (!tableRowsEl) return;

    tableRowsEl.innerHTML = statement.map((bill) => `
      <tr class="border-b border-border">
        <td class="px-4 py-3 text-sm text-text">${bill.session}</td>
        <td class="px-4 py-3 text-sm text-text">${bill.term}</td>
        <td class="px-4 py-3 text-sm text-text">${formatMoney(bill.amountDue)}</td>
        <td class="px-4 py-3 text-sm text-text">${formatMoney(bill.amountPaid)}</td>
        <td class="px-4 py-3 text-sm text-text">${formatMoney(bill.balance)}</td>
        <td class="px-4 py-3 text-sm text-text">${formatDate(bill.dueDate)}</td>
        <td class="px-4 py-3 text-sm">${getStatusBadge(bill.status)}</td>
      </tr>
    `).join('');

    const totalAmounts = statement.reduce(
      (acc, bill) => {
        acc.due += Number(bill.amountDue || 0);
        acc.paid += Number(bill.amountPaid || 0);
        acc.balance += Number(bill.balance || 0);
        return acc;
      },
      { due: 0, paid: 0, balance: 0 }
    );

    tableTotalsEl.innerHTML = `
      <tr class="bg-bg font-semibold text-text">
        <td class="px-4 py-3 text-sm">Totals</td>
        <td class="px-4 py-3 text-sm">—</td>
        <td class="px-4 py-3 text-sm">${formatMoney(totalAmounts.due)}</td>
        <td class="px-4 py-3 text-sm">${formatMoney(totalAmounts.paid)}</td>
        <td class="px-4 py-3 text-sm">${formatMoney(totalAmounts.balance)}</td>
        <td class="px-4 py-3 text-sm">—</td>
        <td class="px-4 py-3 text-sm">—</td>
      </tr>
    `;

    if (collectFeesBtn) {
      collectFeesBtn.href = `./add-payment.html?studentId=${encodeURIComponent(student.id)}&demo=1`;
    }
  }

  function loadStatement() {
    loadingEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');
    contentEl.classList.add('hidden');

    if (backToFeesLink) backToFeesLink.href = `./fees.html${demoMode ? '?demo=1' : ''}`;

    if (!demoMode || !window.FeesDemoData) {
      loadingEl.classList.add('hidden');
      emptyEl.textContent = 'Demo mode is required to view student statements. Add ?demo=1 to the URL.';
      emptyEl.classList.remove('hidden');
      return;
    }

    if (!studentId) {
      loadingEl.classList.add('hidden');
      emptyEl.textContent = 'No student selected. Open a statement from the Fees list to view it here.';
      emptyEl.classList.remove('hidden');
      return;
    }

    const student = window.FeesDemoData.getStudentById(studentId);
    if (!student) {
      loadingEl.classList.add('hidden');
      emptyEl.textContent = 'Student not found.';
      emptyEl.classList.remove('hidden');
      return;
    }

    renderStatement(student);
    loadingEl.classList.add('hidden');
    contentEl.classList.remove('hidden');
  }

  if (printButton) printButton.addEventListener('click', () => window.print());

  loadStatement();
})();
