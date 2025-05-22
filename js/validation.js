// Form Validation Utilities
const Validation = {
    // Email validation
    isValidEmail: (email) => {
        try {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const result = regex.test(email);
            console.log('Email validation:', { email, isValid: result });
            return result;
        } catch (error) {
            console.error('Error in email validation:', error);
            return false;
        }
    },

    // Phone number validation
    isValidPhone: (phone) => {
        try {
            const regex = /^\+?[\d\s-]{10,}$/;
            const result = regex.test(phone);
            console.log('Phone validation:', { phone, isValid: result });
            return result;
        } catch (error) {
            console.error('Error in phone validation:', error);
            return false;
        }
    },

    // Password validation
    isValidPassword: (password) => {
        try {
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/;
            const result = regex.test(password);
            console.log('Password validation:', { isValid: result });
            return result;
        } catch (error) {
            console.error('Error in password validation:', error);
            return false;
        }
    },

    // Name validation
    isValidName: (name) => {
        try {
            const regex = /^[a-zA-Z\s'-]{2,50}$/;
            const result = regex.test(name);
            console.log('Name validation:', { name, isValid: result });
            return result;
        } catch (error) {
            console.error('Error in name validation:', error);
            return false;
        }
    },

    // Date validation
    isValidDate: (date) => {
        try {
            const selectedDate = new Date(date);
            const today = new Date();
            
            // Check if it's a valid date
            if (isNaN(selectedDate.getTime())) {
                console.log('Invalid date format:', date);
                return false;
            }

            // For birth date validation (must be at least 18 years old)
            if (date.includes('-')) {
                const age = today.getFullYear() - selectedDate.getFullYear();
                const monthDiff = today.getMonth() - selectedDate.getMonth();
                
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
                    age--;
                }

                console.log('Age validation:', { date, age, isValid: age >= 18 });
                return age >= 18;
            }

            // For future date validation
            const isValid = selectedDate >= today;
            console.log('Future date validation:', { date, isValid });
            return isValid;
        } catch (error) {
            console.error('Error in date validation:', error);
            return false;
        }
    },

    // File validation
    isValidFile: (file, options = {}) => {
        const {
            maxSize = 5 * 1024 * 1024, // 5MB default
            allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
        } = options;

        if (!file) return false;

        // Check file size
        if (file.size > maxSize) {
            return false;
        }

        // Check file type
        return allowedTypes.includes(file.type);
    },

    // URL validation
    isValidUrl: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Postal code validation (can be customized per country)
    isValidPostalCode: (code, country = 'US') => {
        const patterns = {
            US: /^\d{5}(-\d{4})?$/,
            UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
            CA: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ] ?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i
        };

        return patterns[country] ? patterns[country].test(code) : true;
    },

    // Form field validation
    validateField: (field) => {
        try {
            const value = field.value.trim();
            const type = field.type;
            const required = field.required;

            console.log('Validating field:', { name: field.name, type, required });

            if (required && !value) {
                return {
                    valid: false,
                    message: 'This field is required'
                };
            }

            if (!value) return { valid: true };

            let result;
            switch (type) {
                case 'email':
                    result = {
                        valid: Validation.isValidEmail(value),
                        message: 'Please enter a valid email address'
                    };
                    break;
                case 'tel':
                    result = {
                        valid: Validation.isValidPhone(value),
                        message: 'Please enter a valid phone number'
                    };
                    break;
                case 'password':
                    result = {
                        valid: Validation.isValidPassword(value),
                        message: 'Password must be at least 8 characters long and include uppercase, lowercase, and numbers'
                    };
                    break;
                case 'date':
                    result = {
                        valid: Validation.isValidDate(value),
                        message: field.name.toLowerCase().includes('birth') ? 
                            'You must be at least 18 years old' : 
                            'Please enter a valid date'
                    };
                    break;
                case 'file':
                    result = {
                        valid: field.files.length ? Validation.isValidFile(field.files[0]) : true,
                        message: 'Please upload a valid image file (max 5MB)'
                    };
                    break;
                default:
                    result = { valid: true };
            }

            console.log('Field validation result:', { field: field.name, ...result });
            return result;
        } catch (error) {
            console.error('Error in field validation:', error);
            return {
                valid: false,
                message: 'An error occurred while validating this field'
            };
        }
    },

    // Form validation
    validateForm: (form) => {
        try {
            console.log('Starting form validation');
            const fields = form.querySelectorAll('input, select, textarea');
            let isValid = true;
            const errors = {};

            fields.forEach(field => {
                const result = Validation.validateField(field);
                if (!result.valid) {
                    isValid = false;
                    errors[field.name] = result.message;
                }
            });

            console.log('Form validation result:', { isValid, errors });
            return { isValid, errors };
        } catch (error) {
            console.error('Error in form validation:', error);
            return {
                isValid: false,
                errors: { form: 'An error occurred while validating the form' }
            };
        }
    },

    // Show validation errors
    showErrors: (form, errors) => {
        try {
            console.log('Displaying validation errors:', errors);
            
            // Reset previous errors
            form.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error');
                const errorElement = group.querySelector('.error-message');
                if (errorElement) {
                    errorElement.textContent = '';
                }
            });

            // Show new errors
            Object.entries(errors).forEach(([fieldName, message]) => {
                const field = form.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    const group = field.closest('.form-group');
                    if (group) {
                        group.classList.add('error');
                        const errorElement = group.querySelector('.error-message');
                        if (errorElement) {
                            errorElement.textContent = message;
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error displaying validation errors:', error);
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validation;
} 