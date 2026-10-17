/**
 * Educanize School Management System
 * Sign Up Page Logic & Validation
 */

const API_BASE = 'http://localhost:5000/api/v1';

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const form = document.getElementById('signupForm');
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const submitSpinner = document.getElementById('submitSpinner');
  const formAlert = document.getElementById('formAlert');
  const formAlertText = document.getElementById('formAlertText');
  const successCard = document.getElementById('successCard');
  const formCard = document.getElementById('formCard');

  // Fields
  const fields = {
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    regNo: document.getElementById('regNo'),
    gender: document.getElementById('gender'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirmPassword')
  };

  // Password Strength Elements
  const strengthMeter = document.getElementById('passwordStrengthMeter');
  const strengthBars = [
    document.getElementById('strengthBar1'),
    document.getElementById('strengthBar2'),
    document.getElementById('strengthBar3')
  ];
  const strengthLabel = document.getElementById('strengthLabel');

  // Toggle Password Visibility Buttons
  setupPasswordToggle('togglePassword', fields.password);
  setupPasswordToggle('toggleConfirmPassword', fields.confirmPassword);

  /**
   * Configure show/hide password toggle button
   */
  function setupPasswordToggle(buttonId, inputElement) {
    const btn = document.getElementById(buttonId);
    if (!btn || !inputElement) return;

    btn.addEventListener('click', () => {
      const isPassword = inputElement.getAttribute('type') === 'password';
      inputElement.setAttribute('type', isPassword ? 'text' : 'password');
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');

      // Toggle Eye Icons
      const eyeIcon = btn.querySelector('.icon-eye');
      const eyeOffIcon = btn.querySelector('.icon-eye-off');
      if (eyeIcon && eyeOffIcon) {
        eyeIcon.classList.toggle('hidden', isPassword);
        eyeOffIcon.classList.toggle('hidden', !isPassword);
      }
    });
  }

  /**
   * Field Validation Rules
   */
  const validators = {
    firstName: (value) => {
      const trimmed = value.trim();
      if (!trimmed) return 'First name is required.';
      if (!/^[A-Za-z]+$/.test(trimmed)) return 'First name must contain letters only.';
      return null;
    },
    lastName: (value) => {
      const trimmed = value.trim();
      if (!trimmed) return 'Last name is required.';
      if (!/^[A-Za-z]+$/.test(trimmed)) return 'Last name must contain letters only.';
      return null;
    },
    regNo: (value) => {
      const trimmed = value.trim();
      if (!trimmed) return 'Registration number is required.';
      if (!/^STU-\d+$/.test(trimmed)) {
        return 'Registration number must start with STU- followed by digits (e.g. STU-0001).';
      }
      return null;
    },
    gender: (value) => {
      const trimmed = value.trim();
      if (!trimmed || (trimmed !== 'Male' && trimmed !== 'Female')) {
        return 'Please select your gender.';
      }
      return null;
    },
    email: (value) => {
      const trimmed = value.trim();
      if (!trimmed) return 'Email address is required.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) return 'Please enter a valid email address.';
      return null;
    },
    password: (value) => {
      if (!value) return 'Password is required.';
      if (value.length < 8) return 'Password must be at least 8 characters long.';
      const hasLetter = /[A-Za-z]/.test(value);
      const hasNumber = /\d/.test(value);
      if (!hasLetter || !hasNumber) {
        return 'Password must contain at least one letter and one number.';
      }
      return null;
    },
    confirmPassword: (value) => {
      if (!value) return 'Please confirm your password.';
      if (value !== fields.password.value) return 'Passwords do not match.';
      return null;
    }
  };

  /**
   * Show error for a single field
   */
  function setFieldError(fieldName, errorMessage) {
    const input = fields[fieldName];
    const errorEl = document.getElementById(`${fieldName}-error`);
    if (!input || !errorEl) return;

    if (errorMessage) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', `${fieldName}-error`);
      input.classList.remove('border-border', 'focus:border-primary', 'focus:ring-primary/20');
      input.classList.add('border-danger', 'focus:border-danger', 'focus:ring-danger/20');
      errorEl.textContent = errorMessage;
      errorEl.classList.remove('hidden');
    } else {
      input.setAttribute('aria-invalid', 'false');
      input.removeAttribute('aria-describedby');
      input.classList.remove('border-danger', 'focus:border-danger', 'focus:ring-danger/20');
      input.classList.add('border-border', 'focus:border-primary', 'focus:ring-primary/20');
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
  }

  /**
   * Validate a single field by name
   */
  function validateField(fieldName) {
    const input = fields[fieldName];
    if (!input) return true;
    const validator = validators[fieldName];
    if (!validator) return true;

    const error = validator(input.value);
    setFieldError(fieldName, error);
    return error === null;
  }

  /**
   * Calculate and update Password Strength Meter
   * weak = danger color, medium = warning, strong = success
   */
  function evaluatePasswordStrength(pwd) {
    if (!pwd) {
      strengthBars.forEach(bar => {
        bar.className = 'h-1.5 flex-1 rounded-full bg-border transition-colors duration-200';
      });
      strengthLabel.textContent = '';
      strengthLabel.className = 'text-xs font-medium text-muted';
      return;
    }

    let score = 0;
    const len = pwd.length;
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);

    if (len >= 8) score += 1;
    if (len >= 12) score += 1;
    if (hasLetter && hasNumber) score += 1;
    if (hasUpper && hasLower) score += 1;
    if (hasSpecial) score += 1;

    // Reset base classes
    strengthBars.forEach(bar => {
      bar.className = 'h-1.5 flex-1 rounded-full bg-border transition-colors duration-200';
    });

    if (len < 8 || !hasLetter || !hasNumber || score <= 2) {
      // WEAK -> danger color
      strengthBars[0].className = 'h-1.5 flex-1 rounded-full bg-danger transition-colors duration-200';
      strengthLabel.textContent = 'Weak';
      strengthLabel.className = 'text-xs font-semibold text-danger';
    } else if (score === 3 || score === 4) {
      // MEDIUM -> warning color
      strengthBars[0].className = 'h-1.5 flex-1 rounded-full bg-warning transition-colors duration-200';
      strengthBars[1].className = 'h-1.5 flex-1 rounded-full bg-warning transition-colors duration-200';
      strengthLabel.textContent = 'Medium';
      strengthLabel.className = 'text-xs font-semibold text-warning';
    } else {
      // STRONG -> success color
      strengthBars[0].className = 'h-1.5 flex-1 rounded-full bg-success transition-colors duration-200';
      strengthBars[1].className = 'h-1.5 flex-1 rounded-full bg-success transition-colors duration-200';
      strengthBars[2].className = 'h-1.5 flex-1 rounded-full bg-success transition-colors duration-200';
      strengthLabel.textContent = 'Strong';
      strengthLabel.className = 'text-xs font-semibold text-success';
    }
  }

  /**
   * Top-level form alert helper
   */
  function showFormAlert(message, type = 'danger') {
    if (!formAlert || !formAlertText) return;
    formAlertText.textContent = message;
    formAlert.classList.remove('hidden');

    if (type === 'danger') {
      formAlert.className = 'p-3.5 mb-5 rounded-input bg-danger/10 border border-danger/20 text-danger text-xs flex items-start gap-2.5';
    } else if (type === 'warning') {
      formAlert.className = 'p-3.5 mb-5 rounded-input bg-warning/10 border border-warning/20 text-warning text-xs flex items-start gap-2.5';
    } else {
      formAlert.className = 'p-3.5 mb-5 rounded-input bg-success/10 border border-success/20 text-success text-xs flex items-start gap-2.5';
    }

    formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideFormAlert() {
    if (formAlert) {
      formAlert.classList.add('hidden');
    }
  }

  /**
   * Event Listeners for Validation on Blur & Real-time recovery on Input
   */
  Object.keys(fields).forEach(name => {
    const input = fields[name];
    if (!input) return;

    // Validate on blur
    input.addEventListener('blur', () => {
      validateField(name);
    });

    // Real-time error clearance on input
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') {
        validateField(name);
      }
      hideFormAlert();

      // Specific live listeners
      if (name === 'password') {
        evaluatePasswordStrength(input.value);
        if (fields.confirmPassword.value) {
          validateField('confirmPassword');
        }
      }

      if (name === 'confirmPassword' && fields.confirmPassword.value) {
        validateField('confirmPassword');
      }
    });

    // For select element (gender), validate on change as well
    if (name === 'gender') {
      input.addEventListener('change', () => {
        validateField('gender');
        hideFormAlert();
      });
    }
  });

  /**
   * Show friendly success screen
   */
  function displaySuccessScreen(firstName) {
    if (formCard) formCard.classList.add('hidden');
    if (successCard) {
      const namePlaceholder = document.getElementById('successUserName');
      if (namePlaceholder) {
        namePlaceholder.textContent = firstName ? `, ${firstName}` : '';
      }
      successCard.classList.remove('hidden');
      successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Form Submission Handler
   */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormAlert();

    // Validate all fields
    let isValid = true;
    let firstInvalidInput = null;

    Object.keys(fields).forEach(name => {
      const fieldValid = validateField(name);
      if (!fieldValid) {
        isValid = false;
        if (!firstInvalidInput) {
          firstInvalidInput = fields[name];
        }
      }
    });

    if (!isValid) {
      if (firstInvalidInput) {
        firstInvalidInput.focus();
      }
      return;
    }

    // Prepare payload
    const payload = {
      firstName: fields.firstName.value.trim(),
      lastName: fields.lastName.value.trim(),
      regNo: fields.regNo.value.trim(),
      gender: fields.gender.value.trim(),
      email: fields.email.value.trim(),
      password: fields.password.value
    };

    // Set loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
    if (submitSpinner) submitSpinner.classList.remove('hidden');
    if (submitBtnText) submitBtnText.textContent = 'Creating Account...';

    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        data = {};
      }

      if (response.ok) {
        displaySuccessScreen(payload.firstName);
      } else {
        const errorMsg = (data.message || data.error || '').toLowerCase();

        if (errorMsg.includes('not found') || response.status === 404) {
          // Generic wording for failed matches to preserve student privacy
          showFormAlert('We could not verify this registration number. Please check the number and try again.');
          setFieldError('regNo', 'Registration number could not be verified.');
          fields.regNo.focus();
        } else if (
          errorMsg.includes('already registered') ||
          (errorMsg.includes('registration') && errorMsg.includes('already'))
        ) {
          showFormAlert('This registration number is already registered. Please sign in or contact your school administrator.');
          setFieldError('regNo', 'Registration number already registered.');
          fields.regNo.focus();
        } else if (
          errorMsg.includes('email already in use') ||
          errorMsg.includes('email already exists') ||
          errorMsg.includes('email in use') ||
          (errorMsg.includes('email') && errorMsg.includes('taken'))
        ) {
          showFormAlert('This email address is already in use. Please sign in or try another email.');
          setFieldError('email', 'Email address is already in use.');
          fields.email.focus();
        } else {
          showFormAlert(
            data.message ||
            data.error ||
            'Unable to complete registration. Please verify your details and try again.'
          );
        }
      }
    } catch (networkError) {
      // Server not reachable or network connection failed - handle gracefully without crashing
      showFormAlert('Cannot reach the server. Please check your network connection or verify that the server is running.');
    } finally {
      // Reset loading state
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      if (submitSpinner) submitSpinner.classList.add('hidden');
      if (submitBtnText) submitBtnText.textContent = 'Create Account';
    }
  });
});
