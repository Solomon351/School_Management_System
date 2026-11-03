// TEMPORARY: the server will work out balances and status
(function () {
  'use strict';

  const loadingEl = document.getElementById('payment-loading');
  const errorEl = document.getElementById('payment-error');
  const emptyEl = document.getElementById('payment-empty');
  const contentEl = document.getElementById('payment-content');
  const printButton = document.getElementById('print-button');
  const receiptEl = document.getElementById('payment-receipt');
  const statusEl = document.getElementById('payment-status');
  const amountDisplayEl = document.getElementById('payment-amount-display');
  const balanceRemainingEl = document.getElementById('payment-balance-remaining');
  const paymentInfoDetailsEl = document.getElementById('payment-info-details');
  const studentInfoDetailsEl = document.getElementById('student-info-details');
  const backToFeesLink = document.getElementById('back-to-fees');

  const urlParams = new URLSearchParams(window.location.search);
  const receiptId = urlParams.get('receipt');
  const demoMode = urlParams.get('demo') === '1';

  function formatMoney(amount) {
    return '₦' + Number(amount || 0).toLocaleString('en-NG');
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
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    return `<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes[status] || classes.unpaid}">${label}</span>`;
  }

  function getMethodLabel(method) {
    const labels = {
      card: 'Card',
      transfer: 'Bank Transfer',
      cash: 'Cash',
      pos: 'POS',
      ussd: 'USSD'
    };
    return labels[method] || '—';
  }

  function statusFor(payment) {
    if (!payment) return 'unpaid';
    if (Number(payment.balanceRemaining || 0) <= 0) return 'paid';
    if (payment.dueDate && payment.dueDate < new Date().toISOString().slice(0, 10)) return 'overdue';
    if (Number(payment.amount || 0) > 0) return 'partial';
    return 'unpaid';
  }

  function renderDetail(label, value) {
    return `
      <div class="flex justify-between gap-4 py-3">
        <dt class="text-sm text-muted">${label}</dt>
        <dd class="text-right text-sm font-medium text-text">${value}</dd>
      </div>
    `;
  }

  function loadPayment() {
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    emptyEl.classList.add('hidden');
    contentEl.classList.add('hidden');

    if (backToFeesLink) backToFeesLink.href = `./fees.html${demoMode ? '?demo=1' : ''}`;

    if (!receiptId) {
      loadingEl.classList.add('hidden');
      emptyEl.classList.remove('hidden');
      return;
    }

    setTimeout(() => {
      loadingEl.classList.add('hidden');

      if (!demoMode || !window.FeesDemoData) {
        emptyEl.textContent = 'Demo mode is required to view payment details. Add ?demo=1 to the URL.';
        emptyEl.classList.remove('hidden');
        return;
      }

      const payment = window.FeesDemoData.getPaymentById(receiptId);

      if (!payment) {
        errorEl.textContent = `Payment with receipt #${receiptId} not found.`;
        errorEl.classList.remove('hidden');
        return;
      }

      const status = statusFor(payment);
      receiptEl.textContent = payment.id;
      statusEl.innerHTML = getStatusBadge(status);
      amountDisplayEl.textContent = formatMoney(payment.amount);
      balanceRemainingEl.textContent = formatMoney(payment.balanceRemaining || 0);

      paymentInfoDetailsEl.innerHTML = `
        ${renderDetail('Receipt Number', payment.id)}
        ${renderDetail('Amount', formatMoney(payment.amount))}
        ${renderDetail('Payment Method', getMethodLabel(payment.method))}
        ${renderDetail('Payment Date', formatDate(payment.date))}
        ${renderDetail('Session', payment.session)}
        ${renderDetail('Term', payment.term)}
        ${renderDetail('Balance Remaining', formatMoney(payment.balanceRemaining || 0))}
        ${renderDetail('Status', getStatusBadge(status))}
      `;

      studentInfoDetailsEl.innerHTML = `
        ${renderDetail('Student Name', payment.student)}
        ${renderDetail('Student ID', payment.studentId || '—')}
        ${renderDetail('Class', payment.className || payment.class || '—')}
      `;

      contentEl.classList.remove('hidden');
    }, 300);
  }

  if (printButton) printButton.addEventListener('click', () => window.print());

  loadPayment();
})();
