(function () {
  'use strict';

  const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';
  const searchInput = document.getElementById('list-search');
  const statusFilter = document.getElementById('list-status');
  const sessionFilter = document.getElementById('list-session');
  const termFilter = document.getElementById('list-term');
  const classFilter = document.getElementById('list-class');
  const methodFilter = document.getElementById('list-method');
  const loadingEl = document.getElementById('list-loading');
  const errorEl = document.getElementById('list-error');
  const emptyEl = document.getElementById('list-empty');
  const tableEl = document.getElementById('list-table');
  const rowsEl = document.getElementById('list-rows');
  const paginationEl = document.getElementById('list-pagination');
  const pageInfoEl = document.getElementById('list-page-info');
  const prevBtn = document.getElementById('list-previous');
  const nextBtn = document.getElementById('list-next');
  const recordPaymentBtn = document.getElementById('record-payment-btn');
  const arrearsFilter = document.getElementById('arrears-filter');

  if (!searchInput || !sessionFilter || !termFilter || !classFilter || !methodFilter || !loadingEl || !emptyEl || !tableEl || !rowsEl) {
    return;
  }

  let transactions = [];
  let filteredTransactions = [];
  let currentPage = 1;
  const itemsPerPage = 10;

  function formatMoney(value) {
    return '₦' + Number(value || 0).toLocaleString('en-NG');
  }

  function getStatusBadge(status) {
    const labelMap = {
      paid: 'Paid',
      unpaid: 'Unpaid',
      partial: 'Partial',
      overdue: 'Overdue'
    };
    const classMap = {
      paid: 'bg-success/10 text-success',
      unpaid: 'bg-warning/10 text-warning',
      partial: 'bg-warning/10 text-warning',
      overdue: 'bg-danger/10 text-danger'
    };
    return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${classMap[status] || classMap.unpaid}">${labelMap[status] || 'Unpaid'}</span>`;
  }

  function getMethodLabel(method) {
    const labels = {
      cash: 'Cash',
      transfer: 'Bank Transfer',
      pos: 'POS',
      card: 'Card',
      ussd: 'USSD'
    };
    return labels[method] || method || '—';
  }

  function getStatusForRecord(record) {
    if (typeof record.status === 'string') return record.status;
    if (Number(record.balanceRemaining) <= 0) return 'paid';
    if (record.dueDate && record.dueDate < new Date().toISOString().slice(0, 10)) return 'overdue';
    if (Number(record.amount) > 0) return 'partial';
    return 'unpaid';
  }

  function buildTransactions() {
    if (!window.FeesDemoData) return [];

    const session = sessionFilter.value === 'all' ? 'all' : sessionFilter.value;
    const term = termFilter.value === 'all' ? 'all' : termFilter.value;
    return window.FeesDemoData.getTransactions(session, term);
  }

  function populateClassFilter() {
    if (!window.FeesDemoData) return;
    const classes = [...new Set(window.FeesDemoData.getStudents().map((student) => student.className))].sort();
    classFilter.innerHTML = '<option value="all">All classes</option>' + classes.map((name) => `<option value="${name}">${name}</option>`).join('');
  }

  function renderSummaryStats(scopedTransactions) {
    const collected = scopedTransactions.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const unpaidRows = scopedTransactions.filter((payment) => getStatusForRecord(payment) === 'unpaid');
    const overdueRows = scopedTransactions.filter((payment) => getStatusForRecord(payment) === 'overdue');
    const unpaid = unpaidRows.reduce((sum, payment) => sum + Number(payment.balanceRemaining || 0), 0);
    const overdue = overdueRows.reduce((sum, payment) => sum + Number(payment.balanceRemaining || 0), 0);

    const currentSession = sessionFilter.value === 'all' ? '2026/2027' : sessionFilter.value;
    const currentTerm = termFilter.value === 'all' ? 'First' : termFilter.value;
    const arrearsRows = window.FeesDemoData.getOutstandingRows(currentSession, currentTerm);
    const totalArrears = arrearsRows.reduce((sum, row) => sum + Number(row.totalOwed || 0), 0);

    document.getElementById('stat-collected').textContent = formatMoney(collected);
    document.getElementById('stat-collected-trend').textContent = collected > 0 ? 'Payments recorded' : '—';
    document.getElementById('stat-unpaid').textContent = formatMoney(unpaid);
    document.getElementById('stat-unpaid-count').textContent = `${new Set(unpaidRows.map((payment) => payment.studentId)).size} students`;
    document.getElementById('stat-overdue').textContent = formatMoney(overdue);
    document.getElementById('stat-overdue-count').textContent = `${new Set(overdueRows.map((payment) => payment.studentId)).size} students`;
    document.getElementById('stat-arrears').textContent = formatMoney(totalArrears);
    document.getElementById('stat-arrears-count').textContent = `${new Set(arrearsRows.map((row) => row.studentId)).size} students`;
  }

  function renderTransactions() {
    if (filteredTransactions.length === 0) {
      tableEl.classList.add('hidden');
      emptyEl.classList.remove('hidden');
      if (searchInput.value || statusFilter.value !== 'all' || classFilter.value !== 'all' || methodFilter.value !== 'all' || sessionFilter.value !== 'all' || termFilter.value !== 'all') {
        emptyEl.textContent = 'No transactions match your filters.';
      } else {
        emptyEl.textContent = 'No fee transactions recorded yet.';
      }
      return;
    }

    tableEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredTransactions.slice(start, end);

    rowsEl.innerHTML = pageData.map((payment) => {
      const status = getStatusForRecord(payment);
      const detailUrl = `./payment-details.html?receipt=${encodeURIComponent(payment.id)}&demo=1`;
      return `
        <tr class="border-b border-border transition-colors hover:bg-bg">
          <td class="px-4 py-3 text-sm font-medium text-text">${payment.id}</td>
          <td class="px-4 py-3 text-sm text-text">
            <div class="font-medium text-text">${payment.student}</div>
            <div class="text-xs text-muted">${payment.studentId}</div>
          </td>
          <td class="px-4 py-3 text-sm text-text">${payment.className || '—'}</td>
          <td class="px-4 py-3 text-sm text-text">${payment.session}</td>
          <td class="px-4 py-3 text-sm text-text">${payment.term}</td>
          <td class="px-4 py-3 text-sm text-text">${formatMoney(payment.amount)}</td>
          <td class="px-4 py-3 text-sm text-text">${getMethodLabel(payment.method)}</td>
          <td class="px-4 py-3 text-sm">${getStatusBadge(status)}</td>
          <td class="px-4 py-3 text-sm">
            <a href="${detailUrl}" class="font-medium text-primary hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">View</a>
          </td>
        </tr>
      `;
    }).join('');

    if (totalPages > 1) {
      paginationEl.classList.remove('hidden');
      paginationEl.classList.add('flex');
      pageInfoEl.textContent = `Showing ${start + 1} to ${Math.min(end, filteredTransactions.length)} of ${filteredTransactions.length} transactions`;
      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = currentPage === totalPages;
    } else {
      paginationEl.classList.add('hidden');
    }
  }

  function applyFilters() {
    const search = (searchInput.value || '').toLowerCase();
    const status = statusFilter.value;
    const session = sessionFilter.value;
    const term = termFilter.value;
    const classValue = classFilter.value;
    const method = methodFilter.value;

    const scoped = transactions.filter((payment) => {
      const matchesSession = session === 'all' || payment.session === session;
      const matchesTerm = term === 'all' || payment.term === term;
      return matchesSession && matchesTerm;
    });

    filteredTransactions = scoped.filter((payment) => {
      const matchesSearch = !search || payment.student.toLowerCase().includes(search) || payment.studentId.toLowerCase().includes(search) || (payment.className || '').toLowerCase().includes(search) || payment.id.toLowerCase().includes(search);
      const matchesStatus = status === 'all' || getStatusForRecord(payment) === status;
      const matchesClass = classValue === 'all' || payment.className === classValue;
      const matchesMethod = method === 'all' || payment.method === method;
      return matchesSearch && matchesStatus && matchesClass && matchesMethod;
    });

    currentPage = 1;
    renderSummaryStats(scoped);
    renderTransactions();
  }

  function renderArrears() {
    if (!window.FeesDemoData) return;

    const session = sessionFilter.value === 'all' ? '2026/2027' : sessionFilter.value;
    const term = termFilter.value === 'all' ? 'First' : termFilter.value;
    const rows = window.FeesDemoData.getOutstandingRows(session, term)
      .filter((summary) => {
        if (arrearsFilter && arrearsFilter.value === 'previous') return Number(summary.arrears) > 0;
        return true;
      })
      .filter((summary) => {
        const value = (searchInput.value || '').toLowerCase();
        if (!value) return true;
        return summary.name.toLowerCase().includes(value) || summary.studentId.toLowerCase().includes(value) || summary.className.toLowerCase().includes(value);
      })
      .filter((summary) => classFilter.value === 'all' || summary.className === classFilter.value);

    const tableBody = document.getElementById('arrears-rows');
    if (!tableBody) return;

    if (!rows.length) {
      tableBody.innerHTML = '<tr><td colspan="7" class="px-4 py-6 text-center text-sm text-muted">No outstanding balances found.</td></tr>';
      return;
    }

    tableBody.innerHTML = rows.map((row) => `
      <tr class="border-b border-border">
        <td class="px-4 py-3 text-sm text-text">
          <div class="font-medium text-text">${row.name}</div>
          <div class="text-xs text-muted">${row.studentId}</div>
        </td>
        <td class="px-4 py-3 text-sm text-text">${row.className}</td>
        <td class="px-4 py-3 text-sm text-text">${formatMoney(row.arrears)}</td>
        <td class="px-4 py-3 text-sm text-text">${formatMoney(row.currentBalance)}</td>
        <td class="px-4 py-3 text-sm text-text">${formatMoney(row.totalOwed)}</td>
        <td class="px-4 py-3 text-sm text-text">${row.oldestUnpaid || '—'}</td>
        <td class="px-4 py-3 text-sm text-text">
          <a href="./student-fees.html?studentId=${encodeURIComponent(row.studentId)}&demo=1" class="font-medium text-primary hover:text-primary/80">View statement</a>
        </td>
      </tr>
    `).join('');
  }

  function loadData() {
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    emptyEl.classList.add('hidden');
    tableEl.classList.add('hidden');

    setTimeout(() => {
      loadingEl.classList.add('hidden');
      if (!demoMode || !window.FeesDemoData) {
        transactions = [];
        filteredTransactions = [];
        emptyEl.classList.remove('hidden');
        emptyEl.textContent = 'Demo mode is required to view fee data. Add ?demo=1 to the URL.';
        return;
      }

      populateClassFilter();
      transactions = buildTransactions();
      applyFilters();
      renderArrears();
    }, 250);
  }

  [searchInput, statusFilter, sessionFilter, termFilter, classFilter, methodFilter].forEach((control) => {
    control.addEventListener(control === searchInput ? 'input' : 'change', () => {
      applyFilters();
      renderArrears();
    });
  });

  if (arrearsFilter) {
    arrearsFilter.addEventListener('change', renderArrears);
  }

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderTransactions();
    }
  });

  nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage += 1;
      renderTransactions();
    }
  });

  if (recordPaymentBtn) {
    recordPaymentBtn.href = `./add-payment.html?demo=1`;
  }

  loadData();
})();
