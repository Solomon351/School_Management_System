(function () {
  function initializeAssignmentsPage() {
    const page = document.querySelector('[data-assignments-page]');
    if (!page) return;

    const rowsContainer = document.getElementById('assignment-rows');
    const emptyState = document.getElementById('assignment-empty');
    const table = document.getElementById('assignment-table');
    const searchInput = document.querySelector('#admin-header input[type="search"]');
    const createButton = document.getElementById('assignment-create');
    const feedback = document.getElementById('assignment-feedback');
    const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';

    if (!rowsContainer || !emptyState || !table || !searchInput || !createButton || !feedback) {
      throw new Error('Assignments page is missing a required element.');
    }

    let assignments = [];
    if (demoMode) {
      // TEMPORARY: remove before final merge
      assignments = [
        { title: 'Physics Assignment', className: '10A', due: 'Nov 2', submissions: '32/40', status: 'Published' },
        { title: 'Essay: My School', className: 'JSS2', due: 'Nov 4', submissions: '18/36', status: 'Pending' },
        { title: 'Algebra Set 3', className: 'SS1', due: 'Nov 6', submissions: '40/40', status: 'Done' }
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

    function statusBadge(status) {
      const color = status === 'Published' || status === 'Done'
        ? 'bg-success/10 text-success'
        : status === 'Pending'
          ? 'bg-warning/10 text-warning'
          : 'bg-danger/10 text-danger';

      return `<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${color}">${escapeHtml(status)}</span>`;
    }

    function renderAssignments() {
      const query = searchInput.value.trim().toLowerCase();
      const visibleAssignments = assignments.filter((assignment) => (
        !query || `${assignment.title} ${assignment.className} ${assignment.due} ${assignment.submissions} ${assignment.status}`
          .toLowerCase()
          .includes(query)
      ));

      rowsContainer.innerHTML = visibleAssignments.map((assignment) => `
        <tr class="border-b border-border last:border-0">
          <td class="px-4 py-3 text-sm font-medium text-text">${escapeHtml(assignment.title)}</td>
          <td class="px-4 py-3 text-sm text-text">${escapeHtml(assignment.className)}</td>
          <td class="px-4 py-3 text-sm text-text">${escapeHtml(assignment.due)}</td>
          <td class="px-4 py-3 text-sm text-text">${escapeHtml(assignment.submissions)}</td>
          <td class="px-4 py-3">${statusBadge(assignment.status)}</td>
        </tr>`).join('');

      table.classList.toggle('hidden', visibleAssignments.length === 0);
      emptyState.classList.toggle('hidden', visibleAssignments.length > 0);
      emptyState.textContent = assignments.length
        ? 'No assignments match your search.'
        : 'No assignments are available. Assignment data will appear here when it is provided.';
    }

    searchInput.setAttribute('aria-label', 'Search assignments');
    searchInput.placeholder = 'Search assignments...';
    searchInput.addEventListener('input', renderAssignments);
    createButton.addEventListener('click', () => {
      feedback.textContent = 'Assignment creation is not available here yet.';
      feedback.classList.remove('hidden');
    });

    renderAssignments();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAssignmentsPage);
  } else {
    initializeAssignmentsPage();
  }
})();
