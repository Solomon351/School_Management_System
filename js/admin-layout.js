(function () {
  const navigationItems = [
    ['Dashboard', 'dashboard', '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-6h-4v6H4a1 1 0 0 1-1-1z"/>'],
    ['Students', 'students', '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'],
    ['Teachers', 'teachers', '<path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="M6 10v5c3.5 3 8.5 3 12 0v-5M22 8v6"/>'],
    ['Parents', 'parents', '<circle cx="9" cy="8" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M19 8v6M22 11h-6"/>'],
    ['Academics', 'academics', '<path d="M2 7 12 2l10 5-10 5L2 7Z"/><path d="M6 9v6c3.5 3 8.5 3 12 0V9M22 7v7"/>'],
    ['Attendance', 'attendance', '<path d="m9 11 3 3L22 4"/><path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11"/>'],
    ['Examinations', 'examinations', '<path d="M8 4h8l4 4v12H4V4h4Z"/><path d="M8 4v5h8V4M8 14h8M8 17h5"/>'],
    ['Assignments', 'assignments', '<path d="M8 6h13v14H3V6h5Z"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 11h18M10 15h4"/>'],
    ['Fees & Payments', 'fees-payments', '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h3"/>'],
    ['Timetable', 'timetable', '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h2M14 14h2M8 17h2"/>'],
    ['Reports', 'reports', '<path d="M3 3v18h18M8 16v-5M13 16V7M18 16v-8"/>'],
    ['Notices', 'notices', '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>'],
    ['Scratch Cards', 'scratch-cards', '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h4M7 16h2M16 12v4"/>'],
    ['Settings', 'settings', '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z"/>']
  ];

  const icon = (paths, className) => `
    <svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      ${paths}
    </svg>`;

  function getAdminName() {
    const storedName = localStorage.getItem('userName')
      || localStorage.getItem('name')
      || localStorage.getItem('fullName');

    return storedName && storedName.trim() ? storedName.trim() : 'Admin';
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function currentPage() {
    const filename = window.location.pathname.split('/').pop() || 'dashboard.html';
    return filename.replace(/\.html$/i, '').toLowerCase();
  }

  function injectLayout() {
    const sidebarContainer = document.getElementById('admin-sidebar');
    const headerContainer = document.getElementById('admin-header');

    if (!sidebarContainer || !headerContainer) {
      throw new Error('Admin layout requires #admin-sidebar and #admin-header containers.');
    }

    const activePage = currentPage();
    sidebarContainer.innerHTML = `
      <aside id="admin-sidebar-panel"
        class="sticky top-0 z-40 h-screen w-57.5 shrink-0 overflow-y-auto bg-navy px-3 py-4 text-white/80
          max-[760px]:fixed max-[760px]:inset-y-0 max-[760px]:left-0 max-[760px]:-translate-x-full
          max-[760px]:transition-transform max-[760px]:duration-200"
        aria-label="Admin navigation">
        <a href="./dashboard.html" class="mb-5 flex items-center gap-2 px-2 py-2 text-xl font-extrabold tracking-tight text-white">
          <span aria-hidden="true" class="text-2xl">🎓</span>
          <span>Educ<span class="text-success">anize</span></span>
        </a>
        <nav aria-label="Main navigation" class="space-y-1">
          ${navigationItems.map(([label, page, paths]) => {
            const active = activePage === page;
            return `<a href="./${page}.html"
              class="flex items-center gap-3 rounded-input px-3 py-2.5 text-sm font-medium transition-colors
                ${active ? 'bg-primary text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}"
              ${active ? 'aria-current="page"' : ''}>
              ${icon(paths, 'h-5 w-5 shrink-0')}
              <span>${label}</span>
            </a>`;
          }).join('')}
        </nav>
      </aside>`;

    const adminName = escapeHtml(getAdminName());
    const initials = adminName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();

    headerContainer.innerHTML = `
      <header class="sticky top-0 z-20 flex min-h-17 items-center gap-3 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <button id="admin-menu-button" type="button"
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-input text-text hover:bg-card
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary min-[761px]:hidden"
          aria-label="Open navigation menu" aria-expanded="false" aria-controls="admin-sidebar-panel">
          ${icon('<path d="M4 6h16M4 12h16M4 18h16"/>', 'h-6 w-6')}
        </button>
        <label class="relative min-w-0 max-w-md flex-1">
          ${icon('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>', 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted')}
          <input type="search" placeholder="Search anything..." aria-label="Search"
            class="h-10 w-full rounded-input border border-border bg-card pl-9 pr-9 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
        </label>
        <div class="flex flex-1 items-center justify-end gap-1 sm:gap-2">
          <button type="button" aria-label="Notifications"
            class="inline-flex h-10 w-10 items-center justify-center rounded-input text-muted hover:bg-card hover:text-text">
            ${icon('<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>', 'h-5 w-5')}
          </button>
          <button type="button" aria-label="Messages"
            class="inline-flex h-10 w-10 items-center justify-center rounded-input text-muted hover:bg-card hover:text-text">
            ${icon('<path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8 11h8M8 14h5"/>', 'h-5 w-5')}
          </button>
          <div class="ml-1 flex min-w-0 items-center gap-2 sm:ml-2 sm:gap-3">
            <span aria-hidden="true"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              ${initials || 'A'}
            </span>
            <div class="min-w-0 max-w-18 sm:max-w-none">
              <p class="truncate text-xs font-semibold text-text sm:text-sm">${adminName}</p>
              <p class="truncate text-[10px] text-muted sm:text-xs">Super Admin</p>
            </div>
          </div>
        </div>
      </header>`;

    const sidebar = document.getElementById('admin-sidebar-panel');
    const menuButton = document.getElementById('admin-menu-button');
    const overlay = document.createElement('button');
    overlay.type = 'button';
    overlay.id = 'admin-sidebar-overlay';
    overlay.className = 'fixed inset-0 z-30 hidden bg-navy/70';
    overlay.setAttribute('aria-label', 'Close navigation menu');
    document.body.append(overlay);

    function setDrawerOpen(open) {
      sidebar.classList.toggle('max-[760px]:translate-x-0', open);
      overlay.classList.toggle('hidden', !open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      document.body.classList.toggle('overflow-hidden', open);
    }

    menuButton.addEventListener('click', () => {
      setDrawerOpen(menuButton.getAttribute('aria-expanded') !== 'true');
    });
    overlay.addEventListener('click', () => setDrawerOpen(false));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    });
    sidebar.querySelectorAll('nav a').forEach((link) => {
      link.addEventListener('click', () => setDrawerOpen(false));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectLayout);
  } else {
    injectLayout();
  }
})();
