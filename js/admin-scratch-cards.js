(function () {
  const page = document.querySelector('[data-scratch-cards-page]');
  if (!page) return;

  const batchEmpty = document.getElementById('batch-empty');
  const batchTable = document.getElementById('batch-table');
  const batchRows = document.getElementById('batch-rows');
  const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';

  let batches = [];
  if (demoMode) {
    // TEMPORARY: remove before final merge
    batches = [
      { batch: 'B-003', term: 'First 2026/27', cards: 100, used: 41 },
      { batch: 'B-002', term: 'Third 2025/26', cards: 200, used: 198 },
      { batch: 'B-001', term: 'Second 2025/26', cards: 200, used: 187 }
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

  batchRows.innerHTML = batches.map((batch) => `
    <tr class="border-b border-border last:border-0">
      <td class="px-4 py-3 text-sm font-medium text-text">${escapeHtml(batch.batch)}</td>
      <td class="px-4 py-3 text-sm text-text">${escapeHtml(batch.term)}</td>
      <td class="px-4 py-3 text-sm text-text">${batch.cards}</td>
      <td class="px-4 py-3 text-sm text-text">${batch.used}</td>
    </tr>`).join('');
  batchTable.classList.toggle('hidden', batches.length === 0);
  batchEmpty.classList.toggle('hidden', batches.length > 0);

  document.getElementById('scratch-card-form').addEventListener('submit', (event) => {
    event.preventDefault();
    document.getElementById('generated-empty').textContent =
      'Card generation is not available here yet. No PINs were created.';
  });
})();
