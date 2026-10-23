const API_BASE = 'http://localhost:5000/api/v1';

(function () {
  const path = window.location.pathname.split('/').pop() || '';
  const isAcademicsPage = path === 'academics.html';
  const isClassForm = path === 'add-class.html';
  const isSubjectForm = path === 'add-subject.html';
  const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';

  const demoClasses = [
    { id: 'CLS-101', className: 'SS1', arm: 'A', formTeacherId: 'TCH-201', formTeacher: 'Grace Adebayo', session: '2026/2027', students: 36, subjects: ['Mathematics', 'English'], status: 'Active' },
    { id: 'CLS-102', className: 'SS1', arm: 'B', formTeacherId: 'TCH-202', formTeacher: 'Ifeanyi Okeke', session: '2026/2027', students: 34, subjects: ['English', 'Biology'], status: 'Active' },
    { id: 'CLS-103', className: 'SS2', arm: 'A', formTeacherId: 'TCH-203', formTeacher: 'Fatima Sani', session: '2026/2027', students: 31, subjects: ['Biology', 'Chemistry'], status: 'Active' },
    { id: 'CLS-104', className: 'SS2', arm: 'C', formTeacherId: 'TCH-205', formTeacher: 'Maryam Abubakar', session: '2026/2027', students: 0, subjects: ['English', 'Computer Studies'], status: 'Inactive' },
    { id: 'CLS-105', className: 'JSS1', arm: 'A', formTeacherId: 'TCH-204', formTeacher: 'Samuel Bassey', session: '2026/2027', students: 28, subjects: ['Mathematics', 'English'], status: 'Active' },
    { id: 'CLS-106', className: 'JSS2', arm: 'B', formTeacherId: 'TCH-206', formTeacher: 'Peter Eze', session: '2026/2027', students: 22, subjects: ['Civic Education', 'Computer Studies'], status: 'Inactive' }
  ];

  const demoSubjects = [
    { id: 'SUB-101', subjectName: 'Mathematics', code: 'MTH', classes: ['SS1A', 'JSS1A'], teacherId: 'TCH-201', teacher: 'Grace Adebayo', status: 'Active' },
    { id: 'SUB-102', subjectName: 'English', code: 'ENG', classes: ['SS1A', 'SS1B', 'JSS1A'], teacherId: 'TCH-202', teacher: 'Ifeanyi Okeke', status: 'Active' },
    { id: 'SUB-103', subjectName: 'Biology', code: 'BIO', classes: ['SS2A', 'SS1B'], teacherId: 'TCH-203', teacher: 'Fatima Sani', status: 'Active' },
    { id: 'SUB-104', subjectName: 'Chemistry', code: 'CHE', classes: ['SS2A'], teacherId: 'TCH-203', teacher: 'Fatima Sani', status: 'Inactive' },
    { id: 'SUB-105', subjectName: 'Civic Education', code: 'CIV', classes: ['JSS2B', 'SS1A'], teacherId: 'TCH-204', teacher: 'Samuel Bassey', status: 'Active' },
    { id: 'SUB-106', subjectName: 'Computer Studies', code: 'CMP', classes: ['SS2C', 'JSS2B'], teacherId: 'TCH-206', teacher: 'Peter Eze', status: 'Active' },
    { id: 'SUB-107', subjectName: 'Physics', code: 'PHY', classes: ['SS2A', 'SS1A'], teacherId: 'TCH-201', teacher: 'Grace Adebayo', status: 'Inactive' },
    { id: 'SUB-108', subjectName: 'Geography', code: 'GEO', classes: ['JSS1A', 'JSS2B'], teacherId: 'TCH-208', teacher: 'Musa Garba', status: 'Active' }
  ];

  const demoTeachers = [
    { id: 'TCH-201', firstName: 'Grace', lastName: 'Adebayo', fullName: 'Grace Adebayo' },
    { id: 'TCH-202', firstName: 'Ifeanyi', lastName: 'Okeke', fullName: 'Ifeanyi Okeke' },
    { id: 'TCH-203', firstName: 'Fatima', lastName: 'Sani', fullName: 'Fatima Sani' },
    { id: 'TCH-204', firstName: 'Samuel', lastName: 'Bassey', fullName: 'Samuel Bassey' },
    { id: 'TCH-205', firstName: 'Maryam', lastName: 'Abubakar', fullName: 'Maryam Abubakar' },
    { id: 'TCH-206', firstName: 'Peter', lastName: 'Eze', fullName: 'Peter Eze' },
    { id: 'TCH-207', firstName: 'Bisi', lastName: 'Olawale', fullName: 'Bisi Olawale' },
    { id: 'TCH-208', firstName: 'Musa', lastName: 'Garba', fullName: 'Musa Garba' }
  ];

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function readToken() {
    try {
      const directToken = localStorage.getItem('token')
        || localStorage.getItem('accessToken')
        || localStorage.getItem('authToken');
      if (directToken) return directToken;

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.token || user.accessToken || user.authToken || '';
      }
      return '';
    } catch (error) {
      return '';
    }
  }

  function showFormMessage(message, type) {
    const target = document.getElementById('form-message');
    if (!target) return;
    target.textContent = message;
    target.classList.remove('hidden', 'border-success/20', 'bg-success/10', 'text-success', 'border-danger', 'bg-danger/10', 'text-danger');
    if (type === 'success') {
      target.classList.add('border-success/20', 'bg-success/10', 'text-success');
    } else {
      target.classList.add('border-danger', 'bg-danger/10', 'text-danger');
    }
  }

  function normalizeStatus(value) {
    if (!value) return 'Inactive';
    if (typeof value === 'boolean') return value ? 'Active' : 'Inactive';
    const normalized = String(value).toLowerCase();
    if (normalized === 'true' || normalized === 'active') return 'Active';
    if (normalized === 'archived') return 'Inactive';
    return normalized === 'inactive' ? 'Inactive' : 'Active';
  }

  function formatStatusTag(status) {
    const active = normalizeStatus(status) === 'Active';
    return `<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}">${active ? 'Active' : 'Inactive'}</span>`;
  }

  function getRecordName(record) {
    if (record.subjectName) return `${record.subjectName}`;
    if (record.className && record.arm) return `${record.className}${record.arm}`;
    return record.name || record.title || 'Record';
  }

  function buildClassRecord(raw) {
    const className = raw.className || raw.name || raw.title || '';
    const arm = raw.arm || raw.armName || '';
    const combined = `${className}${arm}`.trim();
    return {
      ...raw,
      id: raw.id || raw._id,
      className,
      arm,
      displayName: combined || raw.displayName || raw.name || 'Class',
      studentCount: Number(raw.students ?? raw.studentCount ?? raw.student_count ?? 0),
      status: normalizeStatus(raw.status)
    };
  }

  function buildSubjectRecord(raw) {
    return {
      ...raw,
      id: raw.id || raw._id,
      subjectName: raw.subjectName || raw.name || raw.subject || '',
      code: raw.code || raw.subjectCode || '',
      classes: Array.isArray(raw.classes) ? raw.classes : [],
      teacherId: raw.teacherId || raw.teacher_id || raw.teacher || '',
      teacher: raw.teacher || raw.teacherName || raw.teacher_name || '',
      status: normalizeStatus(raw.status)
    };
  }

  function updateClassTable() {
    const page = document.querySelector('[data-academics-page]');
    if (!page) return;
    const searchInput = document.getElementById('list-search');
    const statusFilter = document.getElementById('list-status');
    const table = document.getElementById('classes-table');
    const rows = document.getElementById('classes-rows');
    const pagination = document.getElementById('classes-pagination');
    const pageInfo = document.getElementById('classes-page-info');
    const previousButton = document.getElementById('classes-previous');
    const nextButton = document.getElementById('classes-next');
    const loadingState = document.getElementById('list-loading');
    const emptyState = document.getElementById('list-empty');
    const errorState = document.getElementById('list-error');
    const classes = page.__classes || [];
    const query = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const filtered = classes.filter((record) => {
      const matchesQuery = !query || `${record.displayName} ${record.formTeacher || ''} ${record.subjects?.join(' ') || ''}`.toLowerCase().includes(query);
      const status = normalizeStatus(record.status);
      const matchesStatus = selectedStatus === 'all' || (selectedStatus === 'active' && status === 'Active') || (selectedStatus === 'inactive' && status === 'Inactive');
      return matchesQuery && matchesStatus;
    });

    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');

    if (!filtered.length) {
      table.classList.add('hidden');
      pagination.classList.add('hidden');
      pagination.classList.remove('flex');
      emptyState.textContent = classes.length ? 'No classes match your search or status filter.' : 'No classes available yet.';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    table.classList.remove('hidden');
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Number(page.dataset.classPage || 1);
    const safePage = Math.min(currentPage, totalPages);
    page.dataset.classPage = String(safePage);
    const start = (safePage - 1) * pageSize;
    const currentItems = filtered.slice(start, start + pageSize);

    rows.innerHTML = currentItems.map((record) => {
      const rowId = escapeHtml(record.id || '');
      const hasStudents = Number(record.studentCount) > 0;
      const actionText = normalizeStatus(record.status) === 'Active' ? 'Deactivate' : 'Activate';
      const confirmation = hasStudents
        ? `This class has students. It will be archived and never deleted. Do you still want to ${normalizeStatus(record.status) === 'Active' ? 'deactivate' : 'activate'} it?`
        : `Are you sure you want to ${normalizeStatus(record.status) === 'Active' ? 'deactivate' : 'activate'} ${escapeHtml(record.displayName)}?`;
      return `
        <tr class="border-t border-border">
          <td class="whitespace-nowrap px-4 py-3 text-sm text-text">${escapeHtml(record.displayName)}</td>
          <td class="whitespace-nowrap px-4 py-3 text-sm text-text">${escapeHtml(record.formTeacher || '—')}</td>
          <td class="whitespace-nowrap px-4 py-3 text-sm text-text">${escapeHtml(String(record.studentCount ?? 0))}</td>
          <td class="whitespace-nowrap px-4 py-3 text-sm text-text">${escapeHtml((record.subjects || []).join(', ') || '—')}</td>
          <td class="px-4 py-3">${formatStatusTag(record.status)}</td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-2 whitespace-nowrap">
              <a href="./add-class.html?id=${encodeURIComponent(record.id || '')}" class="rounded-input px-2.5 py-1.5 text-xs font-semibold text-text hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Edit</a>
              <button type="button" data-class-status-id="${rowId}" data-confirmation="${escapeHtml(confirmation)}" class="rounded-input px-2.5 py-1.5 text-xs font-semibold ${normalizeStatus(record.status) === 'Active' ? 'text-danger hover:bg-danger/10' : 'text-success hover:bg-success/10'} focus-visible:outline-2 focus-visible:outline-offset-2">
                ${actionText}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    pageInfo.textContent = `Showing ${filtered.length ? start + 1 : 0}–${Math.min(start + pageSize, filtered.length)} of ${filtered.length}`;
    previousButton.disabled = safePage === 1;
    nextButton.disabled = safePage === totalPages;
    pagination.classList.remove('hidden');
    pagination.classList.add('flex');
  }

  function updateSubjectTable() {
    const page = document.querySelector('[data-academics-page]');
    if (!page) return;
    const searchInput = document.getElementById('list-search');
    const statusFilter = document.getElementById('list-status');
    const table = document.getElementById('subjects-table');
    const rows = document.getElementById('subjects-rows');
    const pagination = document.getElementById('subjects-pagination');
    const pageInfo = document.getElementById('subjects-page-info');
    const previousButton = document.getElementById('subjects-previous');
    const nextButton = document.getElementById('subjects-next');
    const loadingState = document.getElementById('list-loading');
    const emptyState = document.getElementById('list-empty');
    const errorState = document.getElementById('list-error');
    const subjects = page.__subjects || [];
    const query = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const filtered = subjects.filter((record) => {
      const matchesQuery = !query || `${record.code || ''} ${record.subjectName || ''} ${record.teacher || ''} ${record.classes?.join(' ') || ''}`.toLowerCase().includes(query);
      const status = normalizeStatus(record.status);
      const matchesStatus = selectedStatus === 'all' || (selectedStatus === 'active' && status === 'Active') || (selectedStatus === 'inactive' && status === 'Inactive');
      return matchesQuery && matchesStatus;
    });

    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');

    if (!filtered.length) {
      table.classList.add('hidden');
      pagination.classList.add('hidden');
      pagination.classList.remove('flex');
      emptyState.textContent = subjects.length ? 'No subjects match your search or status filter.' : 'No subjects available yet.';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    table.classList.remove('hidden');
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Number(page.dataset.subjectPage || 1);
    const safePage = Math.min(currentPage, totalPages);
    page.dataset.subjectPage = String(safePage);
    const start = (safePage - 1) * pageSize;
    const currentItems = filtered.slice(start, start + pageSize);

    rows.innerHTML = currentItems.map((record) => `
      <tr class="border-t border-border">
        <td class="whitespace-nowrap px-4 py-3 text-sm text-text">${escapeHtml(record.code || '—')}</td>
        <td class="whitespace-nowrap px-4 py-3 text-sm text-text">${escapeHtml(record.subjectName || '—')}</td>
        <td class="whitespace-nowrap px-4 py-3 text-sm text-text">${escapeHtml((record.classes || []).join(', ') || '—')}</td>
        <td class="whitespace-nowrap px-4 py-3 text-sm text-text">${escapeHtml(record.teacher || '—')}</td>
        <td class="px-4 py-3">
          <div class="flex items-center gap-2 whitespace-nowrap">
            <a href="./add-subject.html?id=${encodeURIComponent(record.id || '')}" class="rounded-input px-2.5 py-1.5 text-xs font-semibold text-text hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Edit</a>
            <button type="button" data-subject-status-id="${escapeHtml(record.id || '')}" class="rounded-input px-2.5 py-1.5 text-xs font-semibold ${normalizeStatus(record.status) === 'Active' ? 'text-danger hover:bg-danger/10' : 'text-success hover:bg-success/10'} focus-visible:outline-2 focus-visible:outline-offset-2">
              ${normalizeStatus(record.status) === 'Active' ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    pageInfo.textContent = `Showing ${filtered.length ? start + 1 : 0}–${Math.min(start + pageSize, filtered.length)} of ${filtered.length}`;
    previousButton.disabled = safePage === 1;
    nextButton.disabled = safePage === totalPages;
    pagination.classList.remove('hidden');
    pagination.classList.add('flex');
  }

  function renderAcademicsPage() {
    const page = document.querySelector('[data-academics-page]');
    if (!page) return;
    const tabButtons = document.querySelectorAll('[data-tab]');
    const classPanel = document.getElementById('classes-panel');
    const subjectPanel = document.getElementById('subjects-panel');
    const addButton = document.getElementById('add-resource-button');

    const updateTabStyles = (activeTab) => {
      tabButtons.forEach((button) => {
        const isActive = button.dataset.tab === activeTab;
        button.classList.toggle('bg-primary', isActive);
        button.classList.toggle('text-white', isActive);
        button.classList.toggle('shadow-sm', isActive);
        button.classList.toggle('text-muted', !isActive);
        button.setAttribute('aria-selected', String(isActive));
      });
      classPanel.classList.toggle('hidden', activeTab !== 'classes');
      subjectPanel.classList.toggle('hidden', activeTab !== 'subjects');
      addButton.textContent = activeTab === 'classes' ? 'Add Class' : 'Add Subject';
      addButton.href = activeTab === 'classes' ? './add-class.html' : './add-subject.html';
    };

    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const activeTab = button.dataset.tab;
        page.dataset.activeTab = activeTab;
        updateTabStyles(activeTab);
        if (activeTab === 'classes') updateClassTable();
        if (activeTab === 'subjects') updateSubjectTable();
      });
    });

    const activeTab = page.dataset.activeTab || 'classes';
    updateTabStyles(activeTab);
    updateClassTable();
    updateSubjectTable();
  }

  function setupTabFilters() {
    const page = document.querySelector('[data-academics-page]');
    if (!page) return;
    const searchInput = document.getElementById('list-search');
    const statusFilter = document.getElementById('list-status');
    const classesPrev = document.getElementById('classes-previous');
    const classesNext = document.getElementById('classes-next');
    const subjectsPrev = document.getElementById('subjects-previous');
    const subjectsNext = document.getElementById('subjects-next');

    searchInput.addEventListener('input', () => {
      page.dataset.classPage = '1';
      page.dataset.subjectPage = '1';
      updateClassTable();
      updateSubjectTable();
    });

    statusFilter.addEventListener('change', () => {
      page.dataset.classPage = '1';
      page.dataset.subjectPage = '1';
      updateClassTable();
      updateSubjectTable();
    });

    classesPrev.addEventListener('click', () => {
      const nextPage = Math.max(1, Number(page.dataset.classPage || 1) - 1);
      page.dataset.classPage = String(nextPage);
      updateClassTable();
    });

    classesNext.addEventListener('click', () => {
      const nextPage = Number(page.dataset.classPage || 1) + 1;
      page.dataset.classPage = String(nextPage);
      updateClassTable();
    });

    subjectsPrev.addEventListener('click', () => {
      const nextPage = Math.max(1, Number(page.dataset.subjectPage || 1) - 1);
      page.dataset.subjectPage = String(nextPage);
      updateSubjectTable();
    });

    subjectsNext.addEventListener('click', () => {
      const nextPage = Number(page.dataset.subjectPage || 1) + 1;
      page.dataset.subjectPage = String(nextPage);
      updateSubjectTable();
    });
  }

  async function loadAcademicsPage() {
    const page = document.querySelector('[data-academics-page]');
    if (!page) return;

    if (demoMode) {
      // TEMPORARY: remove before final merge
      page.__classes = demoClasses.map(buildClassRecord);
      page.__subjects = demoSubjects.map(buildSubjectRecord);
      renderAcademicsPage();
      setupTabFilters();
      document.body.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-class-status-id]');
        if (!button) return;
        const record = page.__classes.find((item) => String(item.id) === button.dataset.classStatusId);
        if (!record) return;
        const hasStudents = Number(record.studentCount) > 0;
        const isActive = normalizeStatus(record.status) === 'Active';
        const confirmation = hasStudents
          ? `This class has students. It will be archived and never deleted. Do you still want to ${isActive ? 'deactivate' : 'activate'} it?`
          : `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} ${record.displayName}?`;
        if (!window.confirm(confirmation)) return;
        record.status = isActive ? 'Inactive' : 'Active';
        updateClassTable();
      });
      document.body.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-subject-status-id]');
        if (!button) return;
        const record = page.__subjects.find((item) => String(item.id) === button.dataset.subjectStatusId);
        if (!record) return;
        if (!window.confirm(`Are you sure you want to ${normalizeStatus(record.status) === 'Active' ? 'deactivate' : 'activate'} ${record.subjectName}?`)) return;
        record.status = normalizeStatus(record.status) === 'Active' ? 'Inactive' : 'Active';
        updateSubjectTable();
      });
      return;
    }

    try {
      const token = readToken();
      if (!token) {
        throw new Error('You are not signed in. Sign in and reload this page.');
      }

      const [classesResponse, subjectsResponse] = await Promise.all([
        fetch(`${API_BASE}/academics/classes`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        }),
        fetch(`${API_BASE}/academics/subjects`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        })
      ]);

      if (!classesResponse.ok || !subjectsResponse.ok) {
        throw new Error('The academics data could not be loaded.');
      }

      const classesData = await classesResponse.json();
      const subjectsData = await subjectsResponse.json();
      page.__classes = Array.isArray(classesData) ? classesData.map(buildClassRecord) : Array.isArray(classesData.data) ? classesData.data.map(buildClassRecord) : [];
      page.__subjects = Array.isArray(subjectsData) ? subjectsData.map(buildSubjectRecord) : Array.isArray(subjectsData.data) ? subjectsData.data.map(buildSubjectRecord) : [];
      renderAcademicsPage();
      setupTabFilters();
    } catch (error) {
      const loadingState = document.getElementById('list-loading');
      const errorState = document.getElementById('list-error');
      const table = document.getElementById('classes-table');
      const subjectTable = document.getElementById('subjects-table');
      loadingState.classList.add('hidden');
      errorState.textContent = error.message || 'Could not load academics data.';
      errorState.classList.remove('hidden');
      table.classList.add('hidden');
      subjectTable.classList.add('hidden');
    }
  }

  function buildTeacherOptions(targets, teacherList) {
    targets.forEach((target) => {
      if (!target) return;
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Select teacher';
      target.appendChild(placeholder);
      teacherList.forEach((teacher) => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
        target.appendChild(option);
      });
    });
  }

  async function loadTeacherOptions() {
    const select = document.getElementById('formTeacherId');
    const teacherSelect = document.getElementById('teacherId');
    const teacherList = demoMode ? demoTeachers : [];

    if (!demoMode) {
      try {
        const response = await fetch(`${API_BASE}/teachers`, {
          headers: { Authorization: `Bearer ${readToken()}`, Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('failed');
        const data = await response.json();
        const teachers = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
        teacherList.push(...teachers.map((teacher) => ({
          id: String(teacher.id || teacher._id || ''),
          fullName: teacher.fullName || teacher.name || [teacher.firstName, teacher.lastName].filter(Boolean).join(' ')
        })).filter((teacher) => teacher.id && teacher.fullName));
      } catch (error) {
        // Leave the dropdown with just its placeholder if the list can't be loaded.
      }
    }

    buildTeacherOptions([select, teacherSelect], teacherList);
  }

  function buildClassCheckboxes(records) {
    const container = document.getElementById('class-checkboxes');
    if (!container) return;
    container.innerHTML = '';

    records.forEach((record) => {
      const row = document.createElement('label');
      row.className = 'flex items-center gap-2 rounded-input border border-border bg-bg px-3 py-2 text-sm text-text';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'classes';
      input.value = `${record.className}${record.arm}`;
      input.className = 'h-4 w-4 rounded accent-primary';
      row.appendChild(input);
      const text = document.createElement('span');
      text.textContent = `${record.className}${record.arm}`;
      row.appendChild(text);
      container.appendChild(row);
    });
  }

  async function loadClassCheckboxes() {
    let records = demoMode ? demoClasses : [];

    if (!demoMode) {
      try {
        const response = await fetch(`${API_BASE}/academics/classes`, {
          headers: { Authorization: `Bearer ${readToken()}`, Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('failed');
        const data = await response.json();
        const classes = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
        records = classes.map(buildClassRecord).filter((record) => record.className);
      } catch (error) {
        // Leave the container empty; validation will still block submission without options.
      }
    }

    buildClassCheckboxes(records);
  }

  function getFormFields() {
    return Array.from(document.querySelectorAll('#admin-form input[name], #admin-form select[name], #admin-form textarea[name]'));
  }

  function validateField(field) {
    if (!field) return true;
    const errorElement = document.getElementById(`${field.id}-error`) || document.getElementById(`${field.name}-error`);
    if (!errorElement && field.name === 'classes') {
      return true;
    }

    const isRequired = field.required || field.closest('label')?.textContent.includes('*');
    const value = field.type === 'checkbox' ? field.checked : field.value.trim();
    let error = '';

    if (field.name === 'classes') {
      const checked = Array.from(document.querySelectorAll('input[name="classes"]:checked')).length;
      if (checked === 0) error = 'Select at least one class.';
    } else if (field.required && !value) {
      error = 'This field is required.';
    } else if (field.name === 'session' && value && !/^\d{4}\/\d{4}$/.test(value)) {
      error = 'Enter a valid session, e.g. 2026/2027';
    } else if (field.name === 'code' && value && !/^[A-Za-z0-9-]{2,10}$/i.test(value)) {
      error = 'Enter a valid subject code.';
    } else if (field.id === 'formTeacherId' && value && !field.value) {
      error = 'Select a form teacher.';
    }

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
    const fields = getFormFields();
    let valid = true;
    fields.forEach((field) => {
      if (!validateField(field)) valid = false;
    });

    const checkedClasses = document.querySelectorAll('input[name="classes"]:checked');
    const classError = document.getElementById('class-checkboxes-error');
    if (classError) {
      const hasSelection = checkedClasses.length > 0;
      classError.textContent = hasSelection ? '' : 'Select at least one class.';
      classError.classList.toggle('hidden', hasSelection);
      if (!hasSelection) valid = false;
    }

    return valid;
  }

  function setupFormValidation() {
    const fields = getFormFields();
    fields.forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
      field.addEventListener('change', () => {
        if (field.name === 'classes') {
          const classError = document.getElementById('class-checkboxes-error');
          if (classError) {
            const hasSelection = document.querySelectorAll('input[name="classes"]:checked').length > 0;
            classError.textContent = hasSelection ? '' : 'Select at least one class.';
            classError.classList.toggle('hidden', hasSelection);
          }
        }
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
    });
  }

  function populateFormForEdit(formKind) {
    const form = document.getElementById('admin-form');
    if (!form) return;
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    if (demoMode) {
      const list = formKind === 'class' ? demoClasses : demoSubjects;
      const record = list.find((item) => String(item.id) === String(id));
      if (!record) return;
      if (formKind === 'class') {
        form.className.value = record.className || '';
        form.arm.value = record.arm || '';
        form.formTeacherId.value = record.formTeacherId || '';
        form.session.value = record.session || '';
      } else {
        form.subjectName.value = record.subjectName || '';
        form.code.value = record.code || '';
        form.teacherId.value = record.teacherId || '';
        Array.from(document.querySelectorAll('input[name="classes"]')).forEach((input) => {
          input.checked = (record.classes || []).includes(input.value);
        });
      }
      return;
    }

    fetch(`${API_BASE}/academics/${formKind === 'class' ? 'classes' : 'subjects'}/${encodeURIComponent(id)}`, {
      headers: {
        Authorization: `Bearer ${readToken()}`,
        Accept: 'application/json'
      }
    }).then(async (response) => {
      if (!response.ok) return;
      const data = await response.json();
      const record = data.record || data.data || data;
      if (formKind === 'class') {
        form.className.value = record.className || '';
        form.arm.value = record.arm || '';
        form.formTeacherId.value = record.formTeacherId || record.teacherId || '';
        form.session.value = record.session || '';
      } else {
        form.subjectName.value = record.subjectName || record.name || '';
        form.code.value = record.code || '';
        form.teacherId.value = record.teacherId || record.teacher_id || '';
        Array.from(document.querySelectorAll('input[name="classes"]')).forEach((input) => {
          input.checked = (record.classes || []).includes(input.value);
        });
      }
    }).catch(() => {});
  }

  async function submitAcademicForm(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateForm()) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const payload = {};
    const formKind = form.dataset.formKind;
    if (formKind === 'class') {
      payload.className = form.className.value.trim();
      payload.arm = form.arm.value.trim();
      payload.formTeacherId = form.formTeacherId.value.trim();
      payload.session = form.session.value.trim();
    } else {
      payload.subjectName = form.subjectName.value.trim();
      payload.code = form.code.value.trim();
      payload.classes = Array.from(document.querySelectorAll('input[name="classes"]:checked')).map((input) => input.value);
      if (form.teacherId.value.trim()) payload.teacherId = form.teacherId.value.trim();
    }

    const formId = new URLSearchParams(window.location.search).get('id');
    const url = `${API_BASE}/academics/${formKind === 'class' ? 'classes' : 'subjects'}${formId ? `/${encodeURIComponent(formId)}` : ''}`;
    const method = formId ? 'PATCH' : 'POST';

    try {
      if (demoMode) {
        // TEMPORARY: remove before final merge
        if (formKind === 'class') {
          const existing = demoClasses.find((item) => String(item.id) === String(formId));
          if (existing) {
            Object.assign(existing, payload, { id: existing.id, displayName: `${payload.className}${payload.arm}` });
          } else {
            demoClasses.push({
              id: `CLS-${Date.now()}`,
              ...payload,
              formTeacher: demoTeachers.find((teacher) => teacher.id === payload.formTeacherId)?.fullName || 'Unknown',
              students: 0,
              subjects: ['Mathematics'],
              status: 'Active'
            });
          }
        } else {
          const existing = demoSubjects.find((item) => String(item.id) === String(formId));
          if (existing) {
            Object.assign(existing, payload, { id: existing.id, teacher: demoTeachers.find((teacher) => teacher.id === payload.teacherId)?.fullName || '' });
          } else {
            demoSubjects.push({
              id: `SUB-${Date.now()}`,
              ...payload,
              teacher: demoTeachers.find((teacher) => teacher.id === payload.teacherId)?.fullName || '',
              status: 'Active'
            });
          }
        }
        showFormMessage(`${formKind === 'class' ? 'Class' : 'Subject'} saved successfully.`, 'success');
        form.reset();
        const classCheckboxes = document.querySelectorAll('input[name="classes"]');
        classCheckboxes.forEach((input) => { input.checked = false; });
        return;
      }

      const token = readToken();
      if (!token) {
        showFormMessage('You are not signed in. Sign in and reload this page before saving changes.', 'error');
        return;
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      let data = {};
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (error) {
          if (!response.ok) {
            showFormMessage(`Request failed (${response.status}): ${responseText}`, 'error');
            return;
          }
          showFormMessage('Saved successfully, but the server response was not valid JSON.', 'success');
          return;
        }
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `Request failed with status ${response.status}.`);
      }

      showFormMessage(`${formKind === 'class' ? 'Class' : 'Subject'} saved successfully.`, 'success');
      form.reset();
      const classCheckboxes = document.querySelectorAll('input[name="classes"]');
      classCheckboxes.forEach((input) => { input.checked = false; });
    } catch (error) {
      showFormMessage(error.message || 'The record could not be saved. Please try again.', 'error');
    }
  }

  if (isAcademicsPage) {
    loadAcademicsPage();
  }

  if (isClassForm || isSubjectForm) {
    const form = document.getElementById('admin-form');
    if (form) {
      Promise.all([loadTeacherOptions(), loadClassCheckboxes()]).then(() => {
        populateFormForEdit(form.dataset.formKind);
      });
      setupFormValidation();
      form.addEventListener('submit', submitAcademicForm);
    }
  }
})();
