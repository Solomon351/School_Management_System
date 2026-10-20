document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const identifier = document.getElementById('email-address');
  const password = document.getElementById('password');
  const alert = document.getElementById('formAlert');
  const alertText = document.getElementById('formAlertText');
  const togglePassword = document.getElementById('togglePassword');

  if (!form || !identifier || !password) return;

  const fields = [identifier, password];

  function setFieldError(input, message) {
    const error = document.getElementById(`${input.id}-error`);

    if (message) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', error.id);
      input.classList.remove('border-border', 'focus:border-primary', 'focus:ring-primary/20');
      input.classList.add('border-danger', 'focus:border-danger', 'focus:ring-danger/20');
      error.textContent = message;
      error.classList.remove('hidden');
      return false;
    }

    input.setAttribute('aria-invalid', 'false');
    input.removeAttribute('aria-describedby');
    input.classList.remove('border-danger', 'focus:border-danger', 'focus:ring-danger/20');
    input.classList.add('border-border', 'focus:border-primary', 'focus:ring-primary/20');
    error.textContent = '';
    error.classList.add('hidden');
    return true;
  }

  function validateField(input) {
    const value = input.value.trim();
    let message = '';

    if (!value) {
      message = input === identifier ? 'ID or email is required.' : 'Password is required.';
    } else if (input === identifier) {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isSchoolId = /^(STU|TCH)-\d+$/i.test(value);
      if (!isEmail && !isSchoolId) message = 'Enter a valid ID or email address.';
    }

    return setFieldError(input, message);
  }

  fields.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validateField(input);
      alert.classList.add('hidden');
    });
  });

  form.addEventListener('submit', event => {
    const valid = fields.map(validateField).every(Boolean);
    if (valid) return;

    event.preventDefault();
    alertText.textContent = 'Please correct the highlighted fields and try again.';
    alert.className = 'p-3.5 mb-5 rounded-input bg-danger/10 border border-danger/20 text-danger text-xs flex items-start gap-2.5';
    alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      const isPassword = password.type === 'password';
      password.type = isPassword ? 'text' : 'password';
      togglePassword.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      togglePassword.querySelector('.icon-eye').classList.toggle('hidden', isPassword);
      togglePassword.querySelector('.icon-eye-off').classList.toggle('hidden', !isPassword);
    });
  }
});