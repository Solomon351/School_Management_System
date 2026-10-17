/**
 * Educanize Shared Footer Component
 * Injects the shared footer into <div id="site-footer"></div> so any page can reuse it.
 */
(function () {
  function injectFooter() {
    const footerContainer = document.getElementById('site-footer');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
      <footer class="w-full border-t border-border bg-card text-muted font-medium text-xs py-3.5 px-4 sm:px-8 transition-colors">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div class="flex items-center gap-2 flex-wrap justify-center">
            <span class="text-muted">&copy; 2026 Educanize School Management System</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-border/60 text-muted">v1.0.0</span>
          </div>
          <div class="flex items-center gap-4 text-xs font-medium">
            <a href="#support" class="text-muted hover:text-primary transition-colors">Support</a>
            <span class="text-border" aria-hidden="true">|</span>
            <a href="#privacy" class="text-muted hover:text-primary transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    `;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }
})();
