const API_BASE = 'http://localhost:5000/api/v1';

(function () {
  const page = document.querySelector('[data-teacher-profile]');
  if (!page) return;

  const loading = document.getElementById('teacher-profile-loading');
  const errorState = document.getElementById('teacher-profile-error');
  const emptyState = document.getElementById('teacher-profile-empty');
  const content = document.getElementById('teacher-profile-content');
  const statusButton = document.getElementById('teacher-profile-status-button');
  const editLink = document.getElementById('teacher-profile-edit');
  const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';
  const teacherId = new URLSearchParams(window.location.search).get('id');

  if (!loading || !errorState || !emptyState || !content || !statusButton || !editLink) {
    throw new Error('Teacher profile page is missing a required element.');
  }

  let teacher;

  if (demoMode) {
    // TEMPORARY: remove before final merge
    const sampleTeachers = [
      { id: 'TCH-201', firstName: 'Grace', lastName: 'Adebayo', staffId: 'TCH-201', subjects: ['Mathematics', 'Physics'], classes: ['SS1A', 'SS2C'], phoneNumber: '0803 123 4567', status: 'Active' },
      { id: 'TCH-202', firstName: 'Ifeanyi', lastName: 'Okeke', staffId: 'TCH-202', subjects: ['English'], classes: ['JSS1A', 'JSS2B'], phoneNumber: '0806 234 5678', status: 'Active' },
      { id: 'TCH-203', firstName: 'Fatima', lastName: 'Sani', staffId: 'TCH-203', subjects: ['Biology', 'Chemistry'], classes: ['SS2C'], phoneNumber: '0810 345 6789', status: 'Inactive' },
      { id: 'TCH-204', firstName: 'Samuel', lastName: 'Bassey', staffId: 'TCH-204', subjects: ['Civic Education'], classes: ['JSS3B'], phoneNumber: '0809 456 7890', status: 'Active' },
      { id: 'TCH-205', firstName: 'Maryam', lastName: 'Abubakar', staffId: 'TCH-205', subjects: ['English', 'Literature'], classes: ['SS1A', 'SS3A'], phoneNumber: '0814 567 8901', status: 'Active' },
      { id: 'TCH-206', firstName: 'Peter', lastName: 'Eze', staffId: 'TCH-206', subjects: ['Computer Studies'], classes: ['JSS2B'], phoneNumber: '0703 678 9012', status: 'Inactive' },
      { id: 'TCH-207', firstName: 'Bisi', lastName: 'Olawale', staffId: 'TCH-207', subjects: ['Economics'], classes: ['SS3A'], phoneNumber: '0805 789 0123', status: 'Active' },
      { id: 'TCH-208', firstName: 'Musa', lastName: 'Garba', staffId: 'TCH-208', subjects: ['Geography'], classes: ['JSS1A', 'SS1A'], phoneNumber: '0812 890 1234', status: 'Active' }
    ];
    teacher = teacherId
      ? sampleTeachers.find((record) => record.id === teacherId)
      : sampleTeachers[0];
  }

  function getValue(record, keys) {
    for (const key of keys) {
      if (record[key] !== undefined && record[key] !== null && record[key] !== '') return record[key];
    }
    return '';
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

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function personName(record) {
    const directName = getValue(record, ['fullName', 'name', 'displayName']);
    if (directName) return directName;
    return [
      getValue(record, ['firstName', 'first_name']),
      getValue(record, ['lastName', 'last_name'])
    ].filter(Boolean).join(' ') || '—';
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

  function isActive(record) {
    const status = getValue(record, ['status', 'isActive', 'active']);
    if (typeof status === 'boolean') return status;
    if (typeof status === 'string') return status.toLowerCase() !== 'inactive' && status.toLowerCase() !== 'false';
    return status !== 0;
  }

  function detailRows(fields) {
    return fields.map(([label, value]) => `
      <div class="py-3 first:pt-0 last:pb-0">
        <dt class="text-xs font-medium text-muted">${escapeHtml(label)}</dt>
        <dd class="mt-1 break-words text-sm font-medium text-text">${escapeHtml(displayValue(value))}</dd>
      </div>`).join('');
  }

  function updateStatusPresentation() {
    const active = isActive(teacher);
    const status = document.getElementById('teacher-profile-status');
    status.innerHTML = `<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}">${active ? 'Active' : 'Inactive'}</span>`;
    statusButton.textContent = active ? 'Deactivate' : 'Activate';
    statusButton.className = `inline-flex h-10 items-center justify-center rounded-input px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${active ? 'bg-danger text-white hover:bg-danger/90 focus-visible:outline-danger' : 'bg-success text-white hover:bg-success/90 focus-visible:outline-success'}`;
  }

  function renderProfile() {
    const fullName = personName(teacher);
    const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
    const recordId = getValue(teacher, ['id', '_id', 'teacherId']) || teacherId;
    const staffId = getValue(teacher, ['staffId', 'staff_id', 'staffID', 'employeeId']);

    document.getElementById('teacher-profile-name').textContent = displayValue(fullName);
    document.getElementById('teacher-profile-initials').textContent = initials || 'T';
    document.getElementById('teacher-profile-staff-id').textContent = displayValue(staffId);
    document.getElementById('teacher-contact-details').innerHTML = detailRows([
      ['Phone', getValue(teacher, ['phoneNumber', 'phone_number', 'phone', 'telephone'])],
      ['Email', getValue(teacher, ['email', 'emailAddress', 'email_address'])]
    ]);
    document.getElementById('teacher-teaching-details').innerHTML = detailRows([
      ['Subjects', getValue(teacher, ['subjects', 'subject', 'teachingSubjects'])],
      ['Classes', getValue(teacher, ['classes', 'assignedClasses', 'assignedClass', 'className', 'formTeacherOf'])]
    ]);
    editLink.href = `./add-teacher.html?id=${encodeURIComponent(String(recordId))}${demoMode ? '&demo=1' : ''}`;
    updateStatusPresentation();
    loading.classList.add('hidden');
    errorState.classList.add('hidden');
    emptyState.classList.add('hidden');
    content.classList.remove('hidden');
  }

  async function loadTeacher() {
    if (!teacherId) {
      loading.classList.add('hidden');
      if (demoMode && teacher) renderProfile();
      else emptyState.classList.remove('hidden');
      return;
    }

    if (demoMode) {
      if (!teacher) {
        loading.classList.add('hidden');
        errorState.textContent = 'No demo teacher matches this ID.';
        errorState.classList.remove('hidden');
        return;
      }
      renderProfile();
      return;
    }

    try {
      const token = readToken();
      if (!token) throw new Error('You are not signed in. Sign in and reload this page to view teacher details.');

      const response = await fetch(`${API_BASE}/teachers/${encodeURIComponent(teacherId)}`, {
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
        throw new Error(data.message || data.error || `Could not load this teacher (${response.status}).`);
      }

      teacher = data.teacher || (data.data && (data.data.teacher || data.data)) || data;
      if (!teacher || typeof teacher !== 'object' || Array.isArray(teacher)) {
        throw new Error('The server did not return a teacher record.');
      }
      renderProfile();
    } catch (error) {
      loading.classList.add('hidden');
      errorState.textContent = error instanceof Error ? error.message : 'Could not load teacher details.';
      errorState.classList.remove('hidden');
    }
  }

  async function toggleStatus() {
    const active = isActive(teacher);
    const nextStatus = active ? 'Inactive' : 'Active';
    const action = active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${personName(teacher)}?`)) return;

    statusButton.disabled = true;
    try {
      if (!demoMode) {
        const token = readToken();
        if (!token) throw new Error('You are not signed in. Sign in and try again.');
        const recordId = getValue(teacher, ['id', '_id', 'teacherId']) || teacherId;
        if (!recordId) throw new Error('This teacher has no ID and cannot be updated.');

        const response = await fetch(`${API_BASE}/teachers/${encodeURIComponent(String(recordId))}/status`, {
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
          let message = `Could not ${action} this teacher (${response.status}).`;
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

      if (typeof teacher.isActive === 'boolean') teacher.isActive = nextStatus === 'Active';
      else if (typeof teacher.active === 'boolean') teacher.active = nextStatus === 'Active';
      else teacher.status = nextStatus;
      updateStatusPresentation();
    } catch (error) {
      errorState.textContent = error instanceof Error ? error.message : `Could not ${action} this teacher.`;
      errorState.classList.remove('hidden');
    } finally {
      statusButton.disabled = false;
    }
  }

  statusButton.addEventListener('click', toggleStatus);
  loadTeacher();
})();
