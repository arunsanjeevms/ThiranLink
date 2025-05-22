document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const userMenuButton = document.getElementById('userMenuButton');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const logoutButton = document.getElementById('logoutButton');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const personalForm = document.getElementById('personalForm');
    const workForm = document.getElementById('workForm');
    const securityForm = document.getElementById('securityForm');
    const deleteAccount = document.getElementById('deleteAccount');
    const changeAvatar = document.getElementById('changeAvatar');
    const avatarInput = document.getElementById('avatarInput');
    const profileAvatar = document.getElementById('profileAvatar');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // State
    let currentUser = null;

    // Initialize
    const init = () => {
        // Check if user is logged in
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Set user type on body
        document.body.dataset.userType = currentUser.type;

        // Setup user menu
        setupUserMenu();

        // Load user data
        loadUserData();

        // Setup event listeners
        setupEventListeners();
    };

    // Setup user menu
    const setupUserMenu = () => {
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');

        userAvatar.querySelector('img').src = currentUser.avatar || 'https://i.pravatar.cc/150';
        userName.textContent = currentUser.name;

        // Toggle dropdown menu
        userMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('active');
        });

        // Logout functionality
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    };

    // Load user data
    const loadUserData = () => {
        // Set profile header
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileType').textContent = 
            currentUser.type.charAt(0).toUpperCase() + currentUser.type.slice(1);
        profileAvatar.querySelector('img').src = currentUser.avatar || 'https://i.pravatar.cc/150';

        // Set form values
        Object.entries(currentUser).forEach(([key, value]) => {
            const field = document.getElementById(key);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = value;
                } else {
                    field.value = value;
                }
            }
        });

        // Set working days
        if (currentUser.workingDays) {
            document.querySelectorAll('input[name="workingDays"]').forEach(checkbox => {
                checkbox.checked = currentUser.workingDays.includes(checkbox.value);
            });
        }
    };

    // Setup event listeners
    const setupEventListeners = () => {
        // Tab switching
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                
                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                button.classList.add('active');
                document.getElementById(`${tab}Tab`).classList.add('active');
            });
        });

        // Avatar upload
        changeAvatar.addEventListener('click', () => avatarInput.click());
        avatarInput.addEventListener('change', handleAvatarUpload);

        // Password toggles
        togglePasswordButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('input');
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                button.querySelector('i').className = 
                    `fas fa-${type === 'password' ? 'eye' : 'eye-slash'}`;
            });
        });

        // Form submissions
        personalForm.addEventListener('submit', handlePersonalSubmit);
        if (workForm) workForm.addEventListener('submit', handleWorkSubmit);
        securityForm.addEventListener('submit', handleSecuritySubmit);

        // Delete account
        deleteAccount.addEventListener('click', handleDeleteAccount);
    };

    // Handle avatar upload
    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showAlert('error', 'Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const avatar = e.target.result;
            profileAvatar.querySelector('img').src = avatar;
            document.getElementById('userAvatar').querySelector('img').src = avatar;
            
            // Update user data
            currentUser.avatar = avatar;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Update users in localStorage
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            users[currentUser.id] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));

            showAlert('success', 'Profile picture updated successfully');
        };
        reader.readAsDataURL(file);
    };

    // Handle personal form submit
    const handlePersonalSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm(personalForm)) return;

        try {
            // Get form data
            const formData = new FormData(personalForm);
            const data = Object.fromEntries(formData.entries());

            // Update user data
            Object.assign(currentUser, data);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Update users in localStorage
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            users[currentUser.id] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));

            showAlert('success', 'Personal information updated successfully');
        } catch (error) {
            showAlert('error', 'Failed to update personal information');
        }
    };

    // Handle work form submit
    const handleWorkSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm(workForm)) return;

        try {
            // Get form data
            const formData = new FormData(workForm);
            const data = Object.fromEntries(formData.entries());

            // Get working days
            data.workingDays = Array.from(
                workForm.querySelectorAll('input[name="workingDays"]:checked')
            ).map(input => input.value);

            // Update user data
            Object.assign(currentUser, data);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Update users in localStorage
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            users[currentUser.id] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));

            showAlert('success', 'Work details updated successfully');
        } catch (error) {
            showAlert('error', 'Failed to update work details');
        }
    };

    // Handle security form submit
    const handleSecuritySubmit = async (e) => {
        e.preventDefault();
        if (!validateForm(securityForm)) return;

        try {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Verify current password
            if (currentPassword !== currentUser.password) {
                showError(document.getElementById('currentPassword'), 'Current password is incorrect');
                return;
            }

            // Verify password match
            if (newPassword !== confirmPassword) {
                showError(document.getElementById('confirmPassword'), 'Passwords do not match');
                return;
            }

            // Update user data
            currentUser.password = newPassword;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Update users in localStorage
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            users[currentUser.id] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));

            // Reset form
            securityForm.reset();

            showAlert('success', 'Password updated successfully');
        } catch (error) {
            showAlert('error', 'Failed to update password');
        }
    };

    // Handle delete account
    const handleDeleteAccount = () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        try {
            // Remove user from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            delete users[currentUser.id];
            localStorage.setItem('users', JSON.stringify(users));

            // Remove current user
            localStorage.removeItem('currentUser');

            // Redirect to home
            window.location.href = '../index.html';
        } catch (error) {
            showAlert('error', 'Failed to delete account');
        }
    };

    // Form validation
    const validateForm = (form) => {
        let isValid = true;
        const fields = form.querySelectorAll('input, select, textarea');

        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    };

    const validateField = (field) => {
        const formGroup = field.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        let isValid = true;
        let message = '';

        // Reset validation state
        formGroup.classList.remove('error');
        field.setCustomValidity('');

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

        // Phone validation
        if (field.type === 'tel' && field.value) {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(field.value)) {
                isValid = false;
                message = 'Please enter a valid 10-digit phone number';
            }
        }

        // Password validation
        if (field.type === 'password' && field.value && field.id === 'newPassword') {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(field.value)) {
                isValid = false;
                message = 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
            }
        }

        // Show error message if validation fails
        if (!isValid) {
            formGroup.classList.add('error');
            errorMessage.textContent = message;
            field.setCustomValidity(message);
        }

        return isValid;
    };

    // Helper function to show field errors
    const showError = (field, message) => {
        const formGroup = field.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        formGroup.classList.add('error');
        errorMessage.textContent = message;
    };

    // Helper function to show alerts
    const showAlert = (type, message) => {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        // Find the active form
        const activeTab = document.querySelector('.tab-content.active');
        const form = activeTab.querySelector('form');
        form.insertBefore(alert, form.firstChild);

        // Remove alert after 5 seconds
        setTimeout(() => alert.remove(), 5000);
    };

    // Initialize the page
    init();
}); 