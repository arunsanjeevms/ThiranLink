document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.querySelector('.password-toggle');
    const rememberMe = document.getElementById('rememberMe');
    const socialButtons = document.querySelectorAll('.social-login button');

    // Initialize form
    function initializeForm() {
        // Check for remembered credentials
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            emailInput.value = rememberedEmail;
            rememberMe.checked = true;
        }

        // Add required indicator to labels
        document.querySelectorAll('.form-group').forEach(group => {
            const input = group.querySelector('input');
            const label = group.querySelector('label');
            if (input && label && input.hasAttribute('required')) {
                label.innerHTML += ' <span class="required">*</span>';
            }
        });

        // Enable scrolling
        document.body.style.overflowY = 'auto';
    }

    // Initialize the form
    initializeForm();

    // Toggle password visibility
    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            passwordToggle.querySelector('i').className = 
                `fas fa-${type === 'password' ? 'eye' : 'eye-slash'}`;
        });
    }

    // Validate individual field
    function validateField(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return true;

        const errorMessage = formGroup.querySelector('.error-message');
        let isValid = true;
        let message = '';

        // Required field validation
        if (field.required && !field.value.trim()) {
            isValid = false;
            message = 'This field is required';
        }

        // Email validation
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }

        // Password validation
        if (field.type === 'password' && field.value) {
            if (field.value.length < 8) {
                isValid = false;
                message = 'Password must be at least 8 characters long';
            }
        }

        // Update UI
        formGroup.classList.toggle('error', !isValid);
        if (errorMessage) {
            errorMessage.textContent = message;
        }

        return isValid;
    }

    // Handle field validation on input/blur
    document.querySelectorAll('input').forEach(field => {
        field.addEventListener('blur', () => {
            validateField(field);
        });

        field.addEventListener('input', () => {
            // Remove error state as user types
            const formGroup = field.closest('.form-group');
            if (formGroup && formGroup.classList.contains('error')) {
                formGroup.classList.remove('error');
            }
        });
    });

    // Form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;
        let firstError = null;

        // Validate all fields
        loginForm.querySelectorAll('input:not([type="checkbox"])').forEach(field => {
            if (!validateField(field)) {
                isValid = false;
                if (!firstError) {
                    firstError = field;
                }
            }
        });

        if (!isValid) {
            // Scroll to first error with offset for fixed header
            if (firstError) {
                const headerHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const elementPosition = firstError.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Focus the first invalid field
                firstError.focus();
            }
            return;
        }

        // Show loading state
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Logging in...';

        try {
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const email = emailInput.value;
            const password = passwordInput.value;

            // Find user with matching credentials
            const user = Object.values(users).find(u => 
                u.email === email && u.password === password);

            if (user) {
                // Store current user in localStorage
                localStorage.setItem('currentUser', JSON.stringify(user));

                // Remember email if checkbox is checked
                if (rememberMe.checked) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                // Show success message
                showAlert('success', 'Login successful! Redirecting to dashboard...');
                
                // Redirect after delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                throw new Error('Invalid email or password');
            }
        } catch (error) {
            showAlert('error', error.message);
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });

    // Social login buttons
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            const provider = button.classList.contains('btn-google') ? 'Google' : 'Facebook';
            alert(`${provider} login integration coming soon!`);
        });
    });

    // Helper: Show alerts
    function showAlert(type, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Remove existing alerts
        document.querySelectorAll('.alert').forEach(el => el.remove());
        
        // Add new alert at the top of the form
        loginForm.insertBefore(alert, loginForm.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => alert.remove(), 5000);
    }
}); 