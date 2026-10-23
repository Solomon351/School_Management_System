const API_BASE = 'http://localhost:5000/api/v1';

(function () {
  const page = document.querySelector('[data-admin-list]');
  const profilePage = document.querySelector('[data-student-profile]');

  const resource = page ? page.dataset.resource : '';
  const kind = page ? page.dataset.kind : '';
  const tbody = document.getElementById('list-rows');
  const searchInput = document.getElementById('list-search');
  const statusFilter = document.getElementById('list-status');
  const loadingState = document.getElementById('list-loading');
  const emptyState = document.getElementById('list-empty');
  const errorState = document.getElementById('list-error');
  const table = document.getElementById('list-table');
  const pagination = document.getElementById('list-pagination');
  const pageInfo = document.getElementById('list-page-info');
  const previousButton = document.getElementById('list-previous');
  const nextButton = document.getElementById('list-next');
  const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';
  const pageSize = 10;
  let records = [];
  let currentPage = 1;

  const demoRecords = {
    students: [
      { id: 'STU-1001', firstName: 'Amara', lastName: 'Okafor', registrationNumber: 'STU/2026/001', className: 'JSS1A', gender: 'Female', dateOfBirth: '2012-04-18', email: 'amara.okafor@example.edu', stateOfOrigin: 'Anambra', localGovernment: 'Awka South', parentName: 'Chidi Okafor', parentPhone: '0802 111 2233', status: 'Active' },
      { id: 'STU-1002', firstName: 'Tunde', lastName: 'Adeyemi', registrationNumber: 'STU/2026/002', className: 'JSS2B', gender: 'Male', dateOfBirth: '2011-08-03', email: 'tunde.adeyemi@example.edu', stateOfOrigin: 'Oyo', localGovernment: 'Ibadan North', parentName: 'Bola Adeyemi', parentPhone: '0807 222 3344', status: 'Active' },
      { id: 'STU-1003', firstName: 'Zainab', lastName: 'Bello', registrationNumber: 'STU/2026/003', className: 'SS1A', gender: 'Female', dateOfBirth: '2009-12-11', email: 'zainab.bello@example.edu', stateOfOrigin: 'Kaduna', localGovernment: 'Kaduna North', parentName: 'Musa Bello', parentPhone: '0813 333 4455', status: 'Inactive' },
      { id: 'STU-1004', firstName: 'Emeka', lastName: 'Nwosu', registrationNumber: 'STU/2026/004', className: 'JSS3B', gender: 'Male', dateOfBirth: '2010-06-24', email: 'emeka.nwosu@example.edu', stateOfOrigin: 'Imo', localGovernment: 'Owerri Municipal', parentName: 'Ngozi Nwosu', parentPhone: '0804 444 5566', status: 'Active' },
      { id: 'STU-1005', firstName: 'Aisha', lastName: 'Ibrahim', registrationNumber: 'STU/2026/005', className: 'SS2C', gender: 'Female', dateOfBirth: '2008-02-15', email: 'aisha.ibrahim@example.edu', stateOfOrigin: 'Kano', localGovernment: 'Kano Municipal', parentName: 'Usman Ibrahim', parentPhone: '0706 555 6677', status: 'Active' },
      { id: 'STU-1006', firstName: 'Chinedu', lastName: 'Eze', registrationNumber: 'STU/2026/006', className: 'JSS1A', gender: 'Male', dateOfBirth: '2012-10-09', email: 'chinedu.eze@example.edu', stateOfOrigin: 'Enugu', localGovernment: 'Enugu North', parentName: 'Ada Eze', parentPhone: '0816 666 7788', status: 'Inactive' },
      { id: 'STU-1007', firstName: 'Kemi', lastName: 'Ojo', registrationNumber: 'STU/2026/007', className: 'SS3A', gender: 'Female', dateOfBirth: '2007-05-30', email: 'kemi.ojo@example.edu', stateOfOrigin: 'Lagos', localGovernment: 'Ikeja', parentName: 'Femi Ojo', parentPhone: '0808 777 8899', status: 'Active' },
      { id: 'STU-1008', firstName: 'David', lastName: 'Yakubu', registrationNumber: 'STU/2026/008', className: 'JSS2B', gender: 'Male', dateOfBirth: '2011-01-27', email: 'david.yakubu@example.edu', stateOfOrigin: 'Plateau', localGovernment: 'Jos North', parentName: 'Grace Yakubu', parentPhone: '0811 888 9900', status: 'Active' }
    ],
    teachers: [
      { id: 'TCH-201', firstName: 'Grace', lastName: 'Adebayo', staffId: 'TCH-201', subjects: ['Mathematics', 'Physics'], classes: ['SS1A', 'SS2C'], phoneNumber: '0803 123 4567', status: 'Active' },
      { id: 'TCH-202', firstName: 'Ifeanyi', lastName: 'Okeke', staffId: 'TCH-202', subjects: ['English'], classes: ['JSS1A', 'JSS2B'], phoneNumber: '0806 234 5678', status: 'Active' },
      { id: 'TCH-203', firstName: 'Fatima', lastName: 'Sani', staffId: 'TCH-203', subjects: ['Biology', 'Chemistry'], classes: ['SS2C'], phoneNumber: '0810 345 6789', status: 'Inactive' },
      { id: 'TCH-204', firstName: 'Samuel', lastName: 'Bassey', staffId: 'TCH-204', subjects: ['Civic Education'], classes: ['JSS3B'], phoneNumber: '0809 456 7890', status: 'Active' },
      { id: 'TCH-205', firstName: 'Maryam', lastName: 'Abubakar', staffId: 'TCH-205', subjects: ['English', 'Literature'], classes: ['SS1A', 'SS3A'], phoneNumber: '0814 567 8901', status: 'Active' },
      { id: 'TCH-206', firstName: 'Peter', lastName: 'Eze', staffId: 'TCH-206', subjects: ['Computer Studies'], classes: ['JSS2B'], phoneNumber: '0703 678 9012', status: 'Inactive' },
      { id: 'TCH-207', firstName: 'Bisi', lastName: 'Olawale', staffId: 'TCH-207', subjects: ['Economics'], classes: ['SS3A'], phoneNumber: '0805 789 0123', status: 'Active' },
      { id: 'TCH-208', firstName: 'Musa', lastName: 'Garba', staffId: 'TCH-208', subjects: ['Geography'], classes: ['JSS1A', 'SS1A'], phoneNumber: '0812 890 1234', status: 'Active' }
    ],
    parents: [
      { id: 'PAR-301', firstName: 'Chidi', lastName: 'Okafor', phoneNumber: '0802 111 2233', children: ['Amara Okafor'], stateOfOrigin: 'Anambra', status: 'Active' },
      { id: 'PAR-302', firstName: 'Bola', lastName: 'Adeyemi', phoneNumber: '0807 222 3344', children: ['Tunde Adeyemi'], stateOfOrigin: 'Oyo', status: 'Active' },
      { id: 'PAR-303', firstName: 'Musa', lastName: 'Bello', phoneNumber: '0813 333 4455', children: ['Zainab Bello'], stateOfOrigin: 'Kaduna', status: 'Inactive' },
      { id: 'PAR-304', firstName: 'Ngozi', lastName: 'Nwosu', phoneNumber: '0804 444 5566', children: ['Emeka Nwosu'], stateOfOrigin: 'Imo', status: 'Active' },
      { id: 'PAR-305', firstName: 'Usman', lastName: 'Ibrahim', phoneNumber: '0706 555 6677', children: ['Aisha Ibrahim'], stateOfOrigin: 'Kano', status: 'Active' },
      { id: 'PAR-306', firstName: 'Ada', lastName: 'Eze', phoneNumber: '0816 666 7788', children: ['Chinedu Eze'], stateOfOrigin: 'Enugu', status: 'Inactive' },
      { id: 'PAR-307', firstName: 'Femi', lastName: 'Ojo', phoneNumber: '0808 777 8899', children: ['Kemi Ojo'], stateOfOrigin: 'Lagos', status: 'Active' },
      { id: 'PAR-308', firstName: 'Grace', lastName: 'Yakubu', phoneNumber: '0811 888 9900', children: ['David Yakubu'], stateOfOrigin: 'Plateau', status: 'Active' }
    ]
  };

  if (!page) {
    if (profilePage) loadStudentProfile();
    return;
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
      throw new Error('Could not read your saved session. Sign in again and reload this page.');
    }
  }

  function unwrapRecords(data) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== 'object') return [];
    for (const key of [resource, 'records', 'results', 'items']) {
      if (Array.isArray(data[key])) return data[key];
    }
    if (data.data !== undefined) return unwrapRecords(data.data);
    return [];
  }

  function showLoading() {
    loadingState.classList.remove('hidden');
    emptyState.classList.add('hidden');
    errorState.classList.add('hidden');
    table.classList.add('hidden');
    pagination.classList.add('hidden');
    pagination.classList.remove('flex');
  }

  function showError(message) {
    loadingState.classList.add('hidden');
    emptyState.classList.add('hidden');
    errorState.textContent = message;
    errorState.classList.remove('hidden');
    table.classList.add('hidden');
    pagination.classList.add('hidden');
    pagination.classList.remove('flex');
  }

  function displayValue(value) {
    if (Array.isArray(value)) {
      return value.map((item) => {
        if (item && typeof item === 'object') return item.name || item.fullName || item.className || '';
        return item;
      }).filter(Boolean).join(', ') || '—';
    }
    if (value && typeof value === 'object') return value.name || value.fullName || '—';
    if (value === null || value === undefined || String(value).trim() === '') return '—';
    return String(value);
  }

  function getValue(record, keys) {
    for (const key of keys) {
      const value = record[key];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return '';
  }

  function personName(record) {
    const directName = getValue(record, ['fullName', 'name', 'displayName']);
    if (directName) return directName;
    const firstName = getValue(record, ['firstName', 'first_name']);
    const lastName = getValue(record, ['lastName', 'last_name']);
    return [firstName, lastName].filter(Boolean).join(' ') || '—';
  }

  function isActive(record) {
    const status = getValue(record, ['status', 'isActive', 'active']);
    if (typeof status === 'boolean') return status;
    if (typeof status === 'string') return status.toLowerCase() !== 'inactive' && status.toLowerCase() !== 'false';
    return status !== 0;
  }

  function statusTag(active) {
    const classes = active
      ? 'bg-success/10 text-success'
      : 'bg-danger/10 text-danger';
    const label = active ? 'Active' : 'Inactive';
    return `<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}">${label}</span>`;
  }

  async function loadStudentProfile() {
    const loading = document.getElementById('profile-loading');
    const errorState = document.getElementById('profile-error');
    const content = document.getElementById('profile-content');
    const id = new URLSearchParams(window.location.search).get('id');

    if (!id) {
      loading.classList.add('hidden');
      errorState.textContent = 'A student ID was not provided.';
      errorState.classList.remove('hidden');
      return;
    }

    try {
      let record;
      if (demoMode) {
        // TEMPORARY: remove before final merge
        record = demoRecords.students.find((student) => student.id === id);
        if (!record) throw new Error('No demo student matches this ID.');
      } else {
        const token = readToken();
        if (!token) throw new Error('You are not signed in. Sign in and reload this page to view student details.');
        const response = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`, {
          headers: {
            ['Authorization']: ['Bearer', token].join(' '),
            'Accept': 'application/json'
          }
        });
        const responseText = await response.text();
        let data = {};
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (error) {
            throw new Error(`The server returned an invalid response (${response.status}).`);
          }
        }
        if (!response.ok) {
          throw new Error(data.message || data.error || `Could not load this student (${response.status}).`);
        }
        record = data.student || (data.data && (data.data.student || data.data)) || data;
      }

      if (!record || typeof record !== 'object') throw new Error('The server did not return a student record.');

      const fields = [
        ['Registration number', getValue(record, ['registrationNumber', 'registration_number', 'regNo', 'registrationNo'])],
        ['Class', getValue(record, ['className', 'class', 'assignedClass'])],
        ['Gender', getValue(record, ['gender'])],
        ['Date of birth', getValue(record, ['dateOfBirth', 'date_of_birth', 'dob'])],
        ['Email address', getValue(record, ['email', 'emailAddress'])],
        ['State of origin', getValue(record, ['stateOfOrigin', 'state_of_origin', 'state'])],
        ['Local government', getValue(record, ['localGovernment', 'local_government', 'lga'])],
        ['Parent/guardian', getValue(record, ['parentName', 'parent', 'guardianName', 'parentGuardianName'])],
        ['Parent/guardian phone', getValue(record, ['parentPhone', 'parentPhoneNumber', 'guardianPhone'])]
      ];
      document.getElementById('profile-name').textContent = displayValue(personName(record));
      document.getElementById('profile-status').innerHTML = statusTag(isActive(record));
      document.getElementById('profile-details').innerHTML = fields.map(([label, value]) => `
        <div class="border-b border-border py-3 last:border-b-0">
          <dt class="text-xs font-medium text-muted">${escapeHtml(label)}</dt>
          <dd class="mt-1 text-sm font-medium text-text">${escapeHtml(displayValue(value))}</dd>
        </div>`).join('');
      loading.classList.add('hidden');
      errorState.classList.add('hidden');
      content.classList.remove('hidden');
    } catch (error) {
      loading.classList.add('hidden');
      errorState.textContent = error instanceof Error ? error.message : 'Could not load student details.';
      errorState.classList.remove('hidden');
    }
  }

  function rowCells(record, index) {
    const id = getValue(record, ['id', '_id', 'studentId', 'teacherId', 'parentId']);
    const encodedId = encodeURIComponent(String(id || `record-${index + 1}`));
    const name = escapeHtml(displayValue(personName(record)));
    let details;

    if (kind === 'students') {
      details = [
        name,
        escapeHtml(displayValue(getValue(record, ['registrationNumber', 'registration_number', 'regNo', 'registrationNo']))),
        escapeHtml(displayValue(getValue(record, ['className', 'class', 'assignedClass']))),
        escapeHtml(displayValue(getValue(record, ['gender']))),
        escapeHtml(displayValue(getValue(record, ['parentName', 'parent', 'guardianName', 'parentGuardianName']))),
        statusTag(isActive(record))
      ];
    } else if (kind === 'teachers') {
      details = [
        name,
        escapeHtml(displayValue(getValue(record, ['staffId', 'staff_id', 'staffID', 'employeeId']))),
        escapeHtml(displayValue(getValue(record, ['subjects', 'subject']))),
        escapeHtml(displayValue(getValue(record, ['classes', 'assignedClass', 'className', 'formTeacherOf']))),
        escapeHtml(displayValue(getValue(record, ['phoneNumber', 'phone_number', 'phone', 'telephone']))),
        statusTag(isActive(record))
      ];
    } else {
      details = [
        name,
        escapeHtml(displayValue(getValue(record, ['phoneNumber', 'phone_number', 'phone', 'telephone']))),
        escapeHtml(displayValue(getValue(record, ['children', 'childNames', 'linkedChildren', 'child']))),
        escapeHtml(displayValue(getValue(record, ['stateOfOrigin', 'state_of_origin', 'state', 'stateOfOriginName']))),
        statusTag(isActive(record))
      ];
    }

    const actions = `
      <div class="flex items-center gap-2 whitespace-nowrap">
        ${kind === 'students' ? `<a href="./student-profile.html?id=${encodedId}" class="rounded-input px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">View</a>` : ''}
        <a href="./add-${kind.slice(0, -1)}.html?id=${encodedId}" class="rounded-input px-2.5 py-1.5 text-xs font-semibold text-text hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Edit</a>
        <button type="button" data-status-id="${escapeHtml(id || '')}" data-status-index="${index}"
          class="rounded-input px-2.5 py-1.5 text-xs font-semibold ${isActive(record) ? 'text-danger hover:bg-danger/10 focus-visible:outline-danger' : 'text-success hover:bg-success/10 focus-visible:outline-success'} focus-visible:outline-2 focus-visible:outline-offset-2">
          ${isActive(record) ? 'Deactivate' : 'Activate'}
        </button>
      </div>`;

    return `<tr class="border-t border-border">
      ${details.map((value) => `<td class="whitespace-nowrap px-4 py-3 text-sm text-text">${value}</td>`).join('')}
      <td class="px-4 py-3">${actions}</td>
    </tr>`;
  }

  function recordSearchText(record) {
    return Object.values(record).map((value) => {
      if (Array.isArray(value)) return value.map((item) => typeof item === 'object' ? JSON.stringify(item) : item).join(' ');
      return typeof value === 'object' && value !== null ? JSON.stringify(value) : value;
    }).join(' ').toLowerCase();
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const requestedStatus = statusFilter.value;
    const filtered = records.map((record, index) => ({ record, index })).filter(({ record }) => {
      const active = isActive(record);
      const statusMatches = requestedStatus === 'all'
        || (requestedStatus === 'active' && active)
        || (requestedStatus === 'inactive' && !active);
      return statusMatches && (!query || recordSearchText(record).includes(query));
    });

    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    if (filtered.length === 0) {
      table.classList.add('hidden');
      pagination.classList.add('hidden');
      pagination.classList.remove('flex');
      emptyState.textContent = records.length === 0
        ? `No ${kind} yet`
        : `No ${kind} match your search or status filter.`;
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    table.classList.remove('hidden');
    const pageCount = Math.ceil(filtered.length / pageSize);
    currentPage = Math.min(currentPage, pageCount);
    const start = (currentPage - 1) * pageSize;
    tbody.innerHTML = filtered.slice(start, start + pageSize)
      .map(({ record, index }) => rowCells(record, index))
      .join('');

    pageInfo.textContent = `Showing ${start + 1}–${Math.min(start + pageSize, filtered.length)} of ${filtered.length}`;
    previousButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === pageCount;
    pagination.classList.remove('hidden');
    pagination.classList.add('flex');
  }

  async function loadRecords() {
    showLoading();
    if (demoMode) {
      // TEMPORARY: remove before final merge
      records = demoRecords[resource];
      render();
      return;
    }

    try {
      const token = readToken();
      if (!token) throw new Error('You are not signed in. Sign in and reload this page to view records.');
      const response = await fetch(`${API_BASE}/${resource}`, {
        headers: {
          ['Authorization']: ['Bearer', token].join(' '),
          'Accept': 'application/json'
        }
      });

      const responseText = await response.text();
      let data = {};
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (error) {
          throw new Error(`The server returned an invalid response (${response.status}).`);
        }
      }
      if (!response.ok) {
        const message = data.message || data.error || `Could not load ${kind}. Request failed (${response.status}).`;
        throw new Error(message);
      }
      records = unwrapRecords(data);
      render();
    } catch (error) {
      showError(error instanceof Error ? error.message : `Could not load ${kind}. Please try again.`);
    }
  }

  async function updateStatus(button) {
    const index = Number(button.dataset.statusIndex);
    const record = records[index];
    if (!record) return;

    const currentlyActive = isActive(record);
    const nextStatus = currentlyActive ? 'Inactive' : 'Active';
    const name = personName(record);
    const action = currentlyActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${name}?`)) return;

    button.disabled = true;
    try {
      if (!demoMode) {
        const token = readToken();
        if (!token) throw new Error('You are not signed in. Sign in and try again.');
        const id = getValue(record, ['id', '_id', 'studentId', 'teacherId', 'parentId']);
        if (!id) throw new Error('This record has no ID and cannot be updated.');
        const response = await fetch(`${API_BASE}/${resource}/${encodeURIComponent(id)}/status`, {
          method: 'PATCH',
          headers: {
            ['Authorization']: ['Bearer', token].join(' '),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ status: nextStatus })
        });
        if (!response.ok) {
          const responseText = await response.text();
          let message = `Could not ${action} this record (${response.status}).`;
          if (responseText) {
            try {
              const data = JSON.parse(responseText);
              message = data.message || data.error || message;
            } catch (error) {
              message = responseText || message;
            }
          }
          throw new Error(message);
        }
      }

      if (typeof record.isActive === 'boolean') record.isActive = nextStatus === 'Active';
      else if (typeof record.active === 'boolean') record.active = nextStatus === 'Active';
      else record.status = nextStatus;
      render();
    } catch (error) {
      errorState.textContent = error instanceof Error ? error.message : `Could not ${action} this record.`;
      errorState.classList.remove('hidden');
      button.disabled = false;
    }
  }

  searchInput.addEventListener('input', () => {
    currentPage = 1;
    render();
  });
  statusFilter.addEventListener('change', () => {
    currentPage = 1;
    render();
  });
  previousButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage -= 1;
      render();
    }
  });
  nextButton.addEventListener('click', () => {
    currentPage += 1;
    render();
  });
  tbody.addEventListener('click', (event) => {
    const button = event.target.closest('[data-status-index]');
    if (button) updateStatus(button);
  });

  loadRecords();
})();
