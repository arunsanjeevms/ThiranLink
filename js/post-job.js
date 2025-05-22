document.addEventListener('DOMContentLoaded', () => {
    const jobPostForm = document.getElementById('jobPostForm');
    if (!jobPostForm) return;

    const imageInput = document.getElementById('jobImages');
    const imagePreview = document.getElementById('imagePreview');
    const jobDate = document.getElementById('jobDate');
    
    // Initialize form
    function initializeForm() {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        if (jobDate) {
            jobDate.setAttribute('min', today);
            jobDate.value = today;
        }

        // Add required indicator to labels
        document.querySelectorAll('.form-group').forEach(group => {
            const input = group.querySelector('input, select, textarea');
            const label = group.querySelector('label');
            if (input && label && input.hasAttribute('required')) {
                label.innerHTML += ' <span class="required">*</span>';
            }
        });

        // Remove any validation styling
        document.querySelectorAll('input, select, textarea').forEach(input => {
            // Add placeholder if not present
            if (!input.hasAttribute('placeholder') && input.tagName !== 'SELECT') {
                input.setAttribute('placeholder', ' ');
            }
            
            // Remove validation classes
            input.classList.remove('invalid');
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('error');
            }

            // Prevent default validation
            input.setAttribute('novalidate', '');
        });

        // Add novalidate to form
        jobPostForm.setAttribute('novalidate', '');

        // Enable scrolling
        document.body.style.overflowY = 'auto';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Initialize the form
    initializeForm();

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

        // Number validation
        if (field.type === 'number' && field.value) {
            const min = field.getAttribute('min');
            const max = field.getAttribute('max');
            const value = Number(field.value);

            if (min && value < Number(min)) {
                isValid = false;
                message = `Value must be at least ${min}`;
            }
            if (max && value > Number(max)) {
                isValid = false;
                message = `Value must be at most ${max}`;
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
    document.querySelectorAll('input, select, textarea').forEach(field => {
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
    jobPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;
        let firstError = null;

        // Validate all fields
        jobPostForm.querySelectorAll('input, select, textarea').forEach(field => {
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
        const submitButton = jobPostForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Posting...';

        try {
            // Create form data
            const formData = new FormData(jobPostForm);
            const jobData = Object.fromEntries(formData.entries());

            // Add metadata
            jobData.id = 'job_' + Date.now();
            jobData.status = 'open';
            jobData.createdAt = new Date().toISOString();

            // Store job (mock backend)
            const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
            jobs.push(jobData);
            localStorage.setItem('jobs', JSON.stringify(jobs));

            // Show success message
            showAlert('success', 'Job posted successfully! Redirecting to dashboard...');
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } catch (error) {
            showAlert('error', 'An error occurred. Please try again.');
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
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
        jobPostForm.insertBefore(alert, jobPostForm.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => alert.remove(), 5000);
    }

    // Smooth scroll to form sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const section = document.querySelector(this.getAttribute('href'));
            if (section) {
                section.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Smooth scroll to error fields
    function scrollToError(element) {
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    // Image preview functionality with improved validation
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', () => {
            imagePreview.innerHTML = '';
            const files = Array.from(imageInput.files);
            let validFiles = true;

            if (files.length > 5) {
                showError(imageInput, 'Maximum 5 images allowed');
                validFiles = false;
            }

            files.forEach(file => {
                if (file.size > 5 * 1024 * 1024) {
                    showError(imageInput, 'Each image must be less than 5MB');
                    validFiles = false;
                }

                if (!file.type.startsWith('image/')) {
                    showError(imageInput, 'Please upload only image files');
                    validFiles = false;
                }
            });

            if (!validFiles) {
                imageInput.value = '';
                return;
            }

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.createElement('div');
                    preview.className = 'preview-item';
                    preview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <button type="button" class="remove-image" aria-label="Remove image">×</button>
                    `;
                    imagePreview.appendChild(preview);

                    preview.querySelector('.remove-image').addEventListener('click', () => {
                        preview.remove();
                        updateFileInput(files.filter(f => f !== file));
                    });
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Update file input after removing images
    function updateFileInput(remainingFiles) {
        const newFileList = new DataTransfer();
        remainingFiles.forEach(f => newFileList.items.add(f));
        imageInput.files = newFileList.files;
    }

    // Helper: Show field errors
    function showError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            formGroup.classList.add('error');
            errorMessage.textContent = message;
        }
    }
}); 