const API_BASE = 'http://localhost:5000/api/v1';

(function () {
  const form = document.getElementById('admin-form');
  if (!form) return;

  const message = document.getElementById('form-message');
  const submitButton = form.querySelector('button[type="submit"]');
  const endpoint = form.dataset.endpoint;
  const optionalNames = new Set(
    Array.from(form.elements)
      .filter((field) => field.name && !field.required)
      .map((field) => field.name)
  );

  function showMessage(text, type) {
    message.textContent = text;
    message.classList.remove('hidden', 'border-success/20', 'bg-success/10', 'text-success', 'border-danger', 'bg-danger/10', 'text-danger');
    if (type === 'success') {
      message.classList.add('border-success/20', 'bg-success/10', 'text-success');
    } else {
      message.classList.add('border-danger', 'bg-danger/10', 'text-danger');
    }
  }

  function fieldValue(field) {
    if (field instanceof HTMLSelectElement && field.multiple) {
      return Array.from(field.selectedOptions, (option) => option.value);
    }
    return field.value.trim();
  }

  function validateField(field) {
    const value = fieldValue(field);
    const isEmpty = Array.isArray(value) ? value.length === 0 : value === '';
    let error = '';

    if (field.required && isEmpty) {
      error = 'This field is required.';
    } else if (!isEmpty && field.type === 'email' && !field.validity.valid) {
      error = 'Enter a valid email address.';
    } else if (!isEmpty && field.type === 'tel') {
      const digitCount = value.replace(/\D/g, '').length;
      if (digitCount < 7 || digitCount > 15) {
        error = 'Enter a valid phone number.';
      }
    } else if (!isEmpty && field.type === 'date') {
      const today = new Date();
      const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      if (value > localToday) error = 'Date of birth cannot be in the future.';
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

  const fields = Array.from(form.querySelectorAll('input[name], select[name], textarea[name]'));
  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
    field.addEventListener('change', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  });

  function setupLocationDropdowns() {
    const stateSelect = form.elements.stateOfOrigin;
    const lgaSelect = form.elements.localGovernment;
    if (!stateSelect || !lgaSelect) return;

    if (!window.NIGERIA_LOCATIONS) {
      showMessage('Location data could not be loaded. Reload the page and try again.', 'error');
      return;
    }

    Object.keys(window.NIGERIA_LOCATIONS)
      .sort((first, second) => first.localeCompare(second))
      .forEach((state) => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.append(option);
      });

    stateSelect.addEventListener('change', () => {
      lgaSelect.replaceChildren();
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = stateSelect.value ? 'Select local government' : 'Select state first';
      lgaSelect.append(placeholder);

      const localGovernments = window.NIGERIA_LOCATIONS[stateSelect.value] || [];
      localGovernments.forEach((name) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        lgaSelect.append(option);
      });
      lgaSelect.disabled = localGovernments.length === 0;

      if (stateSelect.getAttribute('aria-invalid') === 'true') validateField(stateSelect);
      if (lgaSelect.getAttribute('aria-invalid') === 'true') validateField(lgaSelect);
    });
  }

  function readToken() {
    let directToken;
    let storedUser;
    try {
      directToken = localStorage.getItem('token')
        || localStorage.getItem('accessToken')
        || localStorage.getItem('authToken');
    } catch (error) {
      return { token: '', error: 'Could not read browser session storage. Sign in again before saving this record.' };
    }

    if (directToken) return { token: directToken, error: '' };
    try {
      storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return { token: user.token || user.accessToken || user.authToken || '', error: '' };
      }
    } catch (error) {
      return { token: '', error: 'Your saved session data is invalid. Sign in again before saving this record.' };
    }
    return { token: '', error: '' };
  }

  function createPayload() {
    const payload = {};
    fields.forEach((field) => {
      const value = fieldValue(field);
      if (optionalNames.has(field.name) && (value === '' || (Array.isArray(value) && value.length === 0))) return;
      payload[field.name] = value;
    });

    if (Object.prototype.hasOwnProperty.call(payload, 'createLoginAccount')) {
      payload.createLoginAccount = payload.createLoginAccount === 'Yes';
    }
    return payload;
  }

  function clearValidationErrors() {
    fields.forEach((field) => {
      field.removeAttribute('aria-invalid');
      field.classList.remove('border-danger', 'focus:border-danger');
      const errorElement = document.getElementById(`${field.id}-error`);
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
      }
    });
  }

  function responseMessage(data, fallback) {
    if (data && typeof data.message === 'string' && data.message.trim()) return data.message;
    if (data && typeof data.error === 'string' && data.error.trim()) return data.error;
    return fallback;
  }

  function temporaryPasswordFrom(data) {
    const result = data && data.data && typeof data.data === 'object' ? data.data : data;
    return result && (
      result.temporaryPassword
      || result.tempPassword
      || result.temporary_password
    );
  }

  async function submitToServer(payload, token) {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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
          showMessage(`Request failed (${response.status}): ${responseText}`, 'error');
          return;
        }
        showMessage('Saved successfully, but the server response was not valid JSON. Check the server for any temporary password.', 'success');
        return;
      }
    }

    if (!response.ok) {
      showMessage(responseMessage(data, `Request failed with status ${response.status}. Please check the details and try again.`), 'error');
      return;
    }

    const recordType = endpoint.slice(0, -1);
    const password = temporaryPasswordFrom(data);
    showMessage(
      `${responseMessage(data, `${recordType.charAt(0).toUpperCase()}${recordType.slice(1)} saved successfully.`)}${password ? ` Temporary password: ${password}` : ''}`,
      'success'
    );
    form.reset();
    if (form.elements.stateOfOrigin) {
      form.elements.stateOfOrigin.dispatchEvent(new Event('change'));
    }
    clearValidationErrors();
  }

  setupLocationDropdowns();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.classList.add('hidden');

    const valid = fields.map((field) => validateField(field)).every(Boolean);
    if (!valid) {
      const firstInvalid = fields.find((field) => field.getAttribute('aria-invalid') === 'true');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitButton.disabled = true;
    const originalLabel = submitButton.textContent.trim();
    submitButton.textContent = 'Saving...';

    try {
      const payload = createPayload();
      if (new URLSearchParams(window.location.search).get('demo') === '1') {
        // TEMPORARY: remove before final merge
        await new Promise((resolve) => window.setTimeout(resolve, 1000));
        showMessage('Demo mode: the form was validated successfully. No data was sent to the server.', 'success');
        return;
      }

      const session = readToken();
      if (session.error) {
        showMessage(session.error, 'error');
        return;
      }
      if (!session.token) {
        showMessage('Your session token is missing. Sign in again before saving this record.', 'error');
        return;
      }

      await submitToServer(payload, session.token);
    } catch (error) {
      const detail = error instanceof TypeError
        ? 'Could not connect to the server. Check that the API is running and try again.'
        : `The record could not be saved: ${error.message || 'Unexpected error.'}`;
      showMessage(detail, 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  });
})();
