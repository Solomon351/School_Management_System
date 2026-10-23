const API_BASE = 'http://localhost:5000/api/v1';

(function () {
  const form = document.getElementById('admin-form');
  if (!form) return;

  const message = document.getElementById('form-message');
  const submitButton = form.querySelector('button[type="submit"]');
  const endpoint = form.dataset.endpoint;
  const createLoginAccountField = form.elements.createLoginAccount;
  const passwordField = form.querySelector('#password');
  const confirmPasswordField = form.querySelector('#confirmPassword');
  const passwordFields = document.getElementById('password-fields');
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
    if (!field || field.disabled) return '';
    if (field instanceof HTMLSelectElement && field.multiple) {
      return Array.from(field.selectedOptions, (option) => option.value);
    }
    return field.value.trim();
  }

  function normalizePhoneNumber(value) {
    return value.replace(/[\s-]/g, '');
  }

  function isValidNigerianPhone(value) {
    const normalized = normalizePhoneNumber(value);
    return /^0\d{10}$/.test(normalized) || /^\+234\d{10}$/.test(normalized);
  }

  function validateField(field) {
    if (!field || field.disabled) return true;

    const value = fieldValue(field);
    const isEmpty = Array.isArray(value) ? value.length === 0 : value === '';
    let error = '';

    if (field.required && isEmpty) {
      error = 'This field is required.';
    } else if (!isEmpty && field.type === 'email' && !field.validity.valid) {
      error = 'Enter a valid email address.';
    } else if (!isEmpty && field.type === 'tel' && !isValidNigerianPhone(value)) {
      error = 'Enter a valid Nigerian phone number, e.g. 08012345678';
    } else if (!isEmpty && field.type === 'date') {
      const today = new Date();
      const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      if (value > localToday) error = 'Date of birth cannot be in the future.';
    } else if ((field.id === 'password' || field.name === 'password') && !isEmpty && value.length < 8) {
      error = 'Password must be at least 8 characters.';
    } else if (field.id === 'confirmPassword' && !isEmpty && value.length < 8) {
      error = 'Password must be at least 8 characters.';
    } else if ((field.id === 'password' || field.name === 'password') && !isEmpty && confirmPasswordField && !confirmPasswordField.disabled && confirmPasswordField.value.trim() && value !== confirmPasswordField.value.trim()) {
      error = 'Passwords do not match.';
    } else if (field.id === 'confirmPassword' && !isEmpty && passwordField && !passwordField.disabled && passwordField.value.trim() && value !== passwordField.value.trim()) {
      error = 'Passwords do not match.';
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
      if (field.id === 'password' || field.id === 'confirmPassword') {
        if (passwordField && confirmPasswordField && !passwordField.disabled && !confirmPasswordField.disabled) {
          validateField(passwordField);
          validateField(confirmPasswordField);
        }
      }
    });
    field.addEventListener('change', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      if (field.id === 'password' || field.id === 'confirmPassword') {
        if (passwordField && confirmPasswordField) {
          validateField(passwordField);
          validateField(confirmPasswordField);
        }
      }
    });
  });

  function setupPasswordFields() {
    if (!passwordField || !confirmPasswordField || !passwordFields) return;

    const shouldShowPasswordFields = createLoginAccountField ? createLoginAccountField.value === 'Yes' : false;
    passwordFields.classList.toggle('hidden', !shouldShowPasswordFields);
    passwordField.disabled = !shouldShowPasswordFields;
    confirmPasswordField.disabled = !shouldShowPasswordFields;
    passwordField.required = shouldShowPasswordFields;
    confirmPasswordField.required = shouldShowPasswordFields;

    if (!shouldShowPasswordFields) {
      passwordField.value = '';
      confirmPasswordField.value = '';
      passwordField.setAttribute('aria-invalid', 'false');
      confirmPasswordField.setAttribute('aria-invalid', 'false');
      passwordField.classList.remove('border-danger', 'focus:border-danger');
      confirmPasswordField.classList.remove('border-danger', 'focus:border-danger');
      const passwordError = document.getElementById('password-error');
      const confirmError = document.getElementById('confirmPassword-error');
      if (passwordError) {
        passwordError.textContent = '';
        passwordError.classList.add('hidden');
      }
      if (confirmError) {
        confirmError.textContent = '';
        confirmError.classList.add('hidden');
      }
    }
  }

  function setupPasswordToggles() {
    document.querySelectorAll('[data-password-toggle]').forEach((toggleButton) => {
      const targetId = toggleButton.dataset.passwordToggle;
      if (!targetId) return;
      toggleButton.addEventListener('click', () => {
        const input = form.querySelector(`#${CSS.escape(targetId)}`);
        if (!input) return;
        const shouldShow = input.type === 'password';
        input.type = shouldShow ? 'text' : 'password';
        toggleButton.textContent = shouldShow ? 'Hide' : 'Show';
      });
    });
  }

  function generatePassword() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let generated = '';
    for (let index = 0; index < 10; index += 1) {
      generated += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    if (passwordField) {
      passwordField.value = generated;
      passwordField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (confirmPasswordField) {
      confirmPasswordField.value = generated;
      confirmPasswordField.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  document.querySelectorAll('[data-generate-password]').forEach((button) => {
    button.addEventListener('click', generatePassword);
  });

  if (createLoginAccountField) {
    createLoginAccountField.addEventListener('change', setupPasswordFields);
  }

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
      if (field.disabled || field.name === 'confirmPassword') return;
      const value = fieldValue(field);
      if (optionalNames.has(field.name) && (value === '' || (Array.isArray(value) && value.length === 0))) return;
      if (field.name) payload[field.name] = value;
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
        showMessage('Saved successfully, but the server response was not valid JSON.', 'success');
        return;
      }
    }

    if (!response.ok) {
      showMessage(responseMessage(data, `Request failed with status ${response.status}. Please check the details and try again.`), 'error');
      return;
    }

    const recordType = endpoint.slice(0, -1);
    showMessage(
      responseMessage(data, `${recordType.charAt(0).toUpperCase()}${recordType.slice(1)} saved successfully.`),
      'success'
    );

    if (passwordField) passwordField.value = '';
    if (confirmPasswordField) confirmPasswordField.value = '';
    form.reset();
    setupPasswordFields();
    if (form.elements.stateOfOrigin) {
      form.elements.stateOfOrigin.dispatchEvent(new Event('change'));
    }
    clearValidationErrors();
  }

  setupLocationDropdowns();
  setupPasswordToggles();
  setupPasswordFields();

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
