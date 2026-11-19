// TEMPORARY: the server will work out balances and status
(function () {
  'use strict';

  const form = document.getElementById('admin-form');
  if (!form) return;

  const message = document.getElementById('form-message');
  const submitButton = form.querySelector('button[type="submit"]');
  const sessionSelect = document.getElementById('session');
  const termSelect = document.getElementById('term');
  const classSelect = document.getElementById('class');
  const studentSelect = document.getElementById('student');
  const balanceSummary = document.getElementById('balance-summary');
  const totalDueEl = document.getElementById('total-due');
  const paidSoFarEl = document.getElementById('paid-so-far');
  const remainingBalanceEl = document.getElementById('balance-remaining');
  const noBalanceMessage = document.getElementById('no-balance-message');
  const paymentTypeSelect = document.getElementById('paymentType');
  const amountInput = document.getElementById('amount');
  const paymentMethodSelect = document.getElementById('paymentMethod');
  const paymentDateInput = document.getElementById('paymentDate');
  const noteInput = document.getElementById('note');
  const studentWarning = document.getElementById('student-warning');
  const studentWarningText = document.getElementById('student-warning-text');
  const studentWarningLink = document.getElementById('student-warning-link');
  const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';

  let selectedFee = null;

  function formatMoney(amount) {
    return '₦' + Number(amount || 0).toLocaleString('en-NG');
  }

  function setupBackLink() {
    const demoParam = demoMode ? '?demo=1' : '';
    ['back-to-fees', 'cancel-link'].forEach((id) => {
      const link = document.getElementById(id);
      if (link) link.href = `./fees.html${demoParam}`;
    });
  }

  function showMessage(text, type) {
    if (!message) return;
    message.textContent = text;
    message.classList.remove('hidden', 'border-success/20', 'bg-success/10', 'text-success', 'border-danger', 'bg-danger/10', 'text-danger');
    if (type === 'success') {
      message.classList.add('border-success/20', 'bg-success/10', 'text-success');
    } else {
      message.classList.add('border-danger', 'bg-danger/10', 'text-danger');
    }
    message.classList.remove('hidden');
  }

  function fieldValue(field) {
    if (!field || field.disabled) return '';
    return field.value.trim();
  }

  function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.removeAttribute('aria-invalid');
    field.classList.remove('border-danger', 'focus:border-danger');
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.add('hidden');
    }
  }

  function validateField(field) {
    if (!field || field.disabled) return true;

    const value = fieldValue(field);
    const isEmpty = value === '';
    let error = '';

    if (field.required && isEmpty) {
      error = 'This field is required.';
    } else if (field === amountInput && !isEmpty) {
      const amount = Number(value);
      if (!Number.isFinite(amount) || amount <= 0) {
        error = 'Amount must be greater than zero.';
      } else if (selectedFee && paymentTypeSelect.value === 'part' && amount >= selectedFee.balance) {
        error = `Part payment must be greater than zero and less than the balance of ${formatMoney(selectedFee.balance)}.`;
      } else if (selectedFee && paymentTypeSelect.value === 'full' && amount !== selectedFee.balance) {
        error = 'Full payment must equal the outstanding balance.';
      }
    } else if (!isEmpty && field.type === 'date' && field.id === 'paymentDate') {
      const today = new Date();
      const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      if (value > localToday) error = 'Payment date cannot be in the future.';
    }

    const errorElement = document.getElementById(`${field.id}-error`);
    field.setAttribute('aria-invalid', String(Boolean(error)));
    field.classList.toggle('border-danger', Boolean(error));
    field.classList.toggle('focus:border-danger', Boolean(error));
    if (errorElement) {
      errorElement.textContent = error;
      errorElement.classList.toggle('hidden', !error);
    }
    return !error;
  }

  function validateForm() {
    const fields = [sessionSelect, termSelect, classSelect, studentSelect, paymentTypeSelect, amountInput, paymentMethodSelect, paymentDateInput];
    return fields.reduce((valid, field) => validateField(field) && valid, true);
  }

  function getStudentList(className) {
    if (!window.FeesDemoData || !className) return [];
    return window.FeesDemoData.getStudents().filter((student) => student.className === className);
  }

  function populateClasses() {
    if (!window.FeesDemoData) return;
    const classes = [...new Set(window.FeesDemoData.getStudents().map((student) => student.className))].sort();
    classSelect.innerHTML = '<option value="">Select class</option>' +
      classes.map((className) => `<option value="${className}">${className}</option>`).join('');
  }

  function populateStudents(selectedClass) {
    const filteredStudents = getStudentList(selectedClass);
    studentSelect.innerHTML = filteredStudents.length
      ? '<option value="">Select student</option>' +
        filteredStudents.map((student) => `<option value="${student.id}">${student.name} (${student.id})</option>`).join('')
      : '<option value="">Select a class first</option>';
    studentSelect.disabled = filteredStudents.length === 0;
    resetFeeSelection();
  }

  function updateStudentWarning(student) {
    if (!student || !studentWarning || !studentWarningText || !studentWarningLink) return;

    const earlierArrears = window.FeesDemoData.getEarlierArrears(student.id, sessionSelect.value, termSelect.value);
    if (earlierArrears > 0) {
      studentWarningText.textContent = `This student also owes ${formatMoney(earlierArrears)} from earlier terms`;
      studentWarningLink.href = `./student-fees.html?studentId=${encodeURIComponent(student.id)}&demo=1`;
      studentWarning.classList.remove('hidden');
    } else {
      studentWarning.classList.add('hidden');
      studentWarningText.textContent = '';
    }
  }

  function resetFeeSelection() {
    selectedFee = null;
    balanceSummary.classList.add('hidden');
    paymentTypeSelect.disabled = true;
    amountInput.disabled = true;
    amountInput.readOnly = false;
    amountInput.value = '';
    paymentMethodSelect.disabled = true;
    noBalanceMessage.classList.add('hidden');
    submitButton.disabled = true;
    clearFieldError('paymentType');
    clearFieldError('amount');
    updateStudentWarning(null);
  }

  function updateFeeSummary() {
    const student = window.FeesDemoData ? window.FeesDemoData.getStudentById(studentSelect.value) : null;
    if (!student || !demoMode) {
      resetFeeSelection();
      return;
    }

    const currentBill = window.FeesDemoData.getStudentSummary(student, sessionSelect.value, termSelect.value).currentBill;
    selectedFee = {
      totalDue: Number(currentBill.amountDue || 0),
      paid: Number(currentBill.amountPaid || 0),
      balance: Math.max(Number(currentBill.amountDue || 0) - Number(currentBill.amountPaid || 0), 0),
      dueDate: currentBill.dueDate || '',
      studentId: student.id,
      studentName: student.name
    };

    balanceSummary.classList.remove('hidden');
    totalDueEl.textContent = formatMoney(selectedFee.totalDue);
    paidSoFarEl.textContent = formatMoney(selectedFee.paid);
    remainingBalanceEl.textContent = formatMoney(selectedFee.balance);

    const hasBalance = selectedFee.balance > 0;
    paymentTypeSelect.disabled = !hasBalance;
    amountInput.disabled = !hasBalance;
    paymentMethodSelect.disabled = !hasBalance;
    noBalanceMessage.classList.toggle('hidden', hasBalance);
    submitButton.disabled = !hasBalance;
    updateStudentWarning(student);
    applyPaymentType();
  }

  function applyPaymentType() {
    if (!selectedFee || selectedFee.balance <= 0) {
      amountInput.value = '';
      amountInput.readOnly = false;
      return;
    }

    const isFullPayment = paymentTypeSelect.value === 'full';
    amountInput.readOnly = isFullPayment;
    amountInput.value = isFullPayment ? String(selectedFee.balance) : '';
    amountInput.min = '0.01';
    amountInput.max = isFullPayment ? String(selectedFee.balance) : String(Math.max(selectedFee.balance - 0.01, 0.01));
    if (amountInput.getAttribute('aria-invalid') === 'true') validateField(amountInput);
  }

  function setDefaultDate() {
    const today = new Date();
    paymentDateInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      showMessage('Please fix the errors above.', 'error');
      return;
    }

    if (!selectedFee || selectedFee.balance <= 0) {
      noBalanceMessage.classList.remove('hidden');
      showMessage('No outstanding balance for this term.', 'error');
      submitButton.disabled = true;
      return;
    }

    const amount = Number(fieldValue(amountInput));
    if (paymentTypeSelect.value === 'part' && (amount <= 0 || amount >= selectedFee.balance)) {
      showMessage(`Part payment must be above zero and less than the balance of ${formatMoney(selectedFee.balance)}.`, 'error');
      return;
    }
    if (paymentTypeSelect.value === 'full' && amount !== selectedFee.balance) {
      showMessage('Full payment must equal the outstanding balance.', 'error');
      return;
    }

    const student = window.FeesDemoData.getStudentById(studentSelect.value);
    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    if (!demoMode || !window.FeesDemoData) {
      submitButton.disabled = false;
      submitButton.textContent = 'Save Payment';
      showMessage('Demo mode is required to test this form. Add ?demo=1 to the URL.', 'error');
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    const result = window.FeesDemoData.createPayment(
      student.id,
      sessionSelect.value,
      termSelect.value,
      amount,
      paymentMethodSelect.value,
      paymentDateInput.value,
      noteInput.value
    );

    const newBalance = result ? result.summary.currentBalance : 0;
    showMessage(`Payment recorded successfully! New balance: ${formatMoney(newBalance)}.`, 'success');
    submitButton.textContent = 'Save Payment';
    window.setTimeout(() => {
      window.location.href = './fees.html?demo=1';
    }, 1500);
  }

  form.querySelectorAll('input[name], select[name], textarea[name]').forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
    field.addEventListener('change', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  });

  classSelect.addEventListener('change', () => populateStudents(classSelect.value));
  studentSelect.addEventListener('change', updateFeeSummary);
  sessionSelect.addEventListener('change', updateFeeSummary);
  termSelect.addEventListener('change', updateFeeSummary);
  paymentTypeSelect.addEventListener('change', applyPaymentType);
  form.addEventListener('submit', handleSubmit);

  setupBackLink();
  populateClasses();

  const initialStudentId = new URLSearchParams(window.location.search).get('studentId');
  if (initialStudentId && window.FeesDemoData) {
    const student = window.FeesDemoData.getStudentById(initialStudentId);
    if (student) {
      classSelect.value = student.className;
      populateStudents(student.className);
      studentSelect.value = student.id;
      updateFeeSummary();
    }
  }

  setDefaultDate();
})();
