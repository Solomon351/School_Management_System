(function () {
  const page = document.querySelector('[data-attendance-page]');
  if (!page) return;

  const classFilter = document.getElementById('attendance-class');
  const dateFilter = document.getElementById('attendance-date');
  const statusFilter = document.getElementById('attendance-status-filter');
  const actionButton = document.getElementById('attendance-action');
  const actionIcon = document.getElementById('attendance-action-icon');
  const actionLabel = document.getElementById('attendance-action-label');
  const cancelButton = document.getElementById('attendance-cancel');
  const feedback = document.getElementById('attendance-feedback');
  const emptyState = document.getElementById('attendance-empty');
  const table = document.getElementById('attendance-table');
  const rowsContainer = document.getElementById('attendance-rows');
  const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';
  const today = new Date();
  const localDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');

  let records = [];
  let draftStatuses = {};
  let editing = false;

  if (demoMode) {
    // TEMPORARY: remove before final merge
    records = [
      { id: 'STU-1001', name: 'Mary Johnson', className: 'SS1A', date: localDate, monday: 'Present', tuesday: 'Present', wednesday: 'Present', today: 'Present' },
      { id: 'STU-1002', name: 'James Okoro', className: 'SS1A', date: localDate, monday: 'Present', tuesday: 'Present', wednesday: 'Present', today: 'Present' },
      { id: 'STU-1003', name: 'Amina Bello', className: 'SS1A', date: localDate, monday: 'Present', tuesday: 'Present', wednesday: 'Absent', today: 'Present' },
      { id: 'STU-1004', name: 'David Brown', className: 'SS1A', date: localDate, monday: 'Present', tuesday: 'Present', wednesday: 'Present', today: 'Late' },
      { id: 'STU-1005', name: 'Grace Eze', className: 'SS1A', date: localDate, monday: 'Present', tuesday: 'Present', wednesday: 'Present', today: 'Present' },
      { id: 'STU-1006', name: 'Tunde Ade', className: 'SS1A', date: localDate, monday: 'Present', tuesday: 'Present', wednesday: 'Present', today: 'Present' }
    ];
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function statusClass(status) {
    if (status === 'Present') return 'bg-success/10 text-success';
    if (status === 'Late') return 'bg-warning/10 text-warning';
    return 'bg-danger/10 text-danger';
  }

  function statusMarkup(status) {
    return `<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(status)}">${escapeHtml(status)}</span>`;
  }

  function getVisibleRecords() {
    const className = classFilter.value;
    const date = dateFilter.value;
    const status = statusFilter.value;

    return records.filter((record) => (
      record.date === date
      && (className === 'all' || record.className === className)
      && (status === 'all' || record.today === status)
    ));
  }

  function renderStatus(record) {
    if (!editing) return statusMarkup(record.today);

    const selectedStatus = draftStatuses[record.id] || record.today;
    return `<label class="sr-only" for="attendance-status-${escapeHtml(record.id)}">Status for ${escapeHtml(record.name)}</label>
      <select id="attendance-status-${escapeHtml(record.id)}" data-attendance-status="${escapeHtml(record.id)}"
        class="h-9 min-w-28 rounded-input border border-border bg-bg px-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
        ${['Present', 'Absent', 'Late'].map((status) => `<option value="${status}" ${selectedStatus === status ? 'selected' : ''}>${status}</option>`).join('')}
      </select>`;
  }

  function renderRows(visibleRecords) {
    rowsContainer.innerHTML = visibleRecords.map((record) => `
      <tr class="border-b border-border last:border-0">
        <td class="px-4 py-3 text-sm font-medium text-text">${escapeHtml(record.name)}</td>
        <td class="px-4 py-3 text-sm text-muted">${escapeHtml(record.className)}</td>
        <td class="px-4 py-3">${statusMarkup(record.monday)}</td>
        <td class="px-4 py-3">${statusMarkup(record.tuesday)}</td>
        <td class="px-4 py-3">${statusMarkup(record.wednesday)}</td>
        <td class="px-4 py-3">${renderStatus(record)}</td>
      </tr>`).join('');
  }

  function render() {
    const visibleRecords = getVisibleRecords();
    const hasRecords = visibleRecords.length > 0;

    table.classList.toggle('hidden', !hasRecords);
    emptyState.classList.toggle('hidden', hasRecords);
    actionButton.disabled = !hasRecords;

    if (!records.length) {
      emptyState.textContent = 'No attendance records are available. Attendance data will appear here when it is provided.';
    } else if (!hasRecords) {
      emptyState.textContent = 'No attendance records match these filters.';
    }

    renderRows(visibleRecords);
  }

  function setEditing(isEditing) {
    editing = isEditing;
    classFilter.disabled = isEditing;
    dateFilter.disabled = isEditing;
    statusFilter.disabled = isEditing;
    classFilter.classList.toggle('opacity-60', isEditing);
    dateFilter.classList.toggle('opacity-60', isEditing);
    statusFilter.classList.toggle('opacity-60', isEditing);
    cancelButton.classList.toggle('hidden', !isEditing);
    cancelButton.classList.toggle('inline-flex', isEditing);
    actionIcon.classList.toggle('hidden', isEditing);
    actionLabel.textContent = isEditing ? 'Save Attendance' : 'Take Attendance';
    actionButton.classList.toggle('bg-success', isEditing);
    actionButton.classList.toggle('hover:bg-success/90', isEditing);
    actionButton.classList.toggle('bg-primary', !isEditing);
    actionButton.classList.toggle('hover:bg-primary/90', !isEditing);
    render();
  }

  Array.from(new Set(records.map((record) => record.className))).forEach((className) => {
    const option = document.createElement('option');
    option.value = className;
    option.textContent = className;
    classFilter.append(option);
  });

  dateFilter.value = localDate;
  render();

  classFilter.addEventListener('change', render);
  dateFilter.addEventListener('change', render);
  statusFilter.addEventListener('change', render);

  actionButton.addEventListener('click', () => {
    if (!editing) {
      draftStatuses = {};
      setEditing(true);
      feedback.classList.add('hidden');
      return;
    }

    records = records.map((record) => ({
      ...record,
      today: draftStatuses[record.id] || record.today
    }));
    draftStatuses = {};
    setEditing(false);
    feedback.textContent = `Attendance marked for ${dateFilter.value}. Changes are only kept for this demo session.`;
    feedback.classList.remove('hidden');
  });

  cancelButton.addEventListener('click', () => {
    draftStatuses = {};
    setEditing(false);
    feedback.classList.add('hidden');
  });

  rowsContainer.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement) || !target.hasAttribute('data-attendance-status')) return;

    draftStatuses[target.dataset.attendanceStatus] = target.value;
  });
})();
