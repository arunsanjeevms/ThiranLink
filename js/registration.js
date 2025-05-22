document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.getElementById('registrationForm');
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const progressSteps = Array.from(document.querySelectorAll('.progress-step'));
    const nextBtn = document.getElementById('nextStep');
    const prevBtn = document.getElementById('prevStep');
    const submitBtn = document.getElementById('submitForm');
    const primaryCategory = document.getElementById('primaryCategory');
    const primarySkill = document.getElementById('primarySkill');

    let currentStep = 0;
    const totalSteps = steps.length;

    // Debug logging
    console.log('Registration form initialized');
    console.log('Total steps:', totalSteps);

    // Category and Skill Mapping
    const skillsByCategory = {
        construction: [
            { value: 'mason', label: 'Mason' },
            { value: 'plumber', label: 'Plumber' },
            { value: 'electrician', label: 'Electrician' },
            { value: 'tile_setter', label: 'Tile Setter' },
            { value: 'welder', label: 'Welder' },
            { value: 'fabricator', label: 'Fabricator' }
        ],
        woodwork: [
            { value: 'carpenter', label: 'Carpenter' },
            { value: 'furniture_maker', label: 'Furniture Maker' },
            { value: 'wood_polisher', label: 'Wood Polisher' }
        ],
        metalwork: [
            { value: 'blacksmith', label: 'Blacksmith' },
            { value: 'sheet_metal', label: 'Sheet Metal Worker' },
            { value: 'fitter', label: 'Fitter' }
        ],
        painting: [
            { value: 'painter', label: 'Painter' },
            { value: 'pop_designer', label: 'POP Designer' },
            { value: 'wallpaper_expert', label: 'Wallpaper Expert' }
        ],
        home_services: [
            { value: 'cleaner', label: 'Cleaner' },
            { value: 'cook', label: 'Cook' },
            { value: 'housekeeper', label: 'Housekeeper' },
            { value: 'pest_control', label: 'Pest Control Technician' }
        ],
        // Add more categories...
    };

    // Initialize form
    function initForm() {
        try {
            showStep(currentStep);
            initializeSkillTags();
            initializeTimeSlots();
            initializeFileUpload();
            initializeCategorySelection();
            console.log('Form initialization complete');
        } catch (error) {
            console.error('Error initializing form:', error);
            showErrorMessage('There was an error initializing the form. Please refresh the page.');
        }
    }

    // Initialize category selection
    function initializeCategorySelection() {
        primaryCategory.addEventListener('change', function() {
            const category = this.value;
            updateSkillOptions(category);
            updateSkillTags(category);
        });
    }

    // Update skill options based on selected category
    function updateSkillOptions(category) {
        primarySkill.innerHTML = '<option value="">Select your primary skill</option>';
        
        if (category && skillsByCategory[category]) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = category.charAt(0).toUpperCase() + category.slice(1);
            
            skillsByCategory[category].forEach(skill => {
                const option = document.createElement('option');
                option.value = skill.value;
                option.textContent = skill.label;
                optgroup.appendChild(option);
            });
            
            primarySkill.appendChild(optgroup);
        }
    }

    // Update skill tags based on selected category
    function updateSkillTags(category) {
        const skillsContainer = document.querySelector('.skills-container');
        skillsContainer.innerHTML = '';

        if (category && skillsByCategory[category]) {
            const skillCategory = document.createElement('div');
            skillCategory.className = 'skill-category';
            
            const title = document.createElement('h4');
            title.textContent = category.charAt(0).toUpperCase() + category.slice(1) + ' Skills';
            skillCategory.appendChild(title);

            const skillTags = document.createElement('div');
            skillTags.className = 'skill-tags';

            skillsByCategory[category].forEach(skill => {
                const tag = document.createElement('div');
                tag.className = 'skill-tag';
                tag.dataset.skill = skill.value;
                tag.innerHTML = `<i class="fas fa-tools"></i>${skill.label}`;
                tag.addEventListener('click', () => tag.classList.toggle('selected'));
                skillTags.appendChild(tag);
            });

            skillCategory.appendChild(skillTags);
            skillsContainer.appendChild(skillCategory);
        }
    }

    // Show specific step
    function showStep(step) {
        try {
            console.log('Showing step:', step);
            steps.forEach((s, index) => {
                s.classList.remove('active');
                progressSteps[index].classList.remove('active', 'completed');
            });

            steps[step].classList.add('active');
            progressSteps[step].classList.add('active');

            // Mark completed steps
            for (let i = 0; i < step; i++) {
                progressSteps[i].classList.add('completed');
            }

            // Update buttons
            prevBtn.style.display = step === 0 ? 'none' : 'block';
            nextBtn.style.display = step === totalSteps - 1 ? 'none' : 'block';
            submitBtn.style.display = step === totalSteps - 1 ? 'block' : 'none';

            // Scroll to top
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Error showing step:', error);
            showErrorMessage('Error navigating between steps');
        }
    }

    // Validate current step
    function validateStep(step) {
        const currentStepEl = steps[step];
        const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            const formGroup = input.closest('.form-group');
            formGroup.classList.remove('error');

            if (!input.value.trim()) {
                formGroup.classList.add('error');
                isValid = false;
            }

            // Email validation
            if (input.type === 'email' && input.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    formGroup.classList.add('error');
                    isValid = false;
                }
            }

            // Phone validation
            if (input.type === 'tel' && input.value) {
                const phoneRegex = /^\+?[\d\s-]{10,}$/;
                if (!phoneRegex.test(input.value)) {
                    formGroup.classList.add('error');
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    // Show error message
    function showError(group, element, message) {
        group.classList.add('error');
        element.textContent = message;
    }

    // Initialize skill tags
    function initializeSkillTags() {
        const skillTags = document.querySelectorAll('.skill-tag');
        skillTags.forEach(tag => {
            tag.addEventListener('click', () => {
                tag.classList.toggle('selected');
            });
        });
    }

    // Initialize time slots
    function initializeTimeSlots() {
        const timeSlots = document.querySelectorAll('.time-slot');
        timeSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                slot.classList.toggle('selected');
            });
        });
    }

    // Initialize file upload
    function initializeFileUpload() {
        const fileUpload = document.querySelector('.file-upload');
        const fileInput = document.getElementById('profilePicture');
        const preview = document.createElement('img');
        preview.className = 'file-preview';
        preview.style.display = 'none';
        preview.style.maxWidth = '200px';
        preview.style.marginTop = '1rem';
        fileUpload.appendChild(preview);

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });

        // Drag and drop functionality
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.classList.add('dragover');
        });

        fileUpload.addEventListener('dragleave', () => {
            fileUpload.classList.remove('dragover');
        });

        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                fileInput.files = e.dataTransfer.files;
                const event = new Event('change');
                fileInput.dispatchEvent(event);
            }
        });
    }

    // Event Listeners
    nextBtn.addEventListener('click', () => {
        console.log('Next button clicked. Current step:', currentStep);
        if (validateStep(currentStep)) {
            currentStep++;
            showStep(currentStep);
        } else {
            console.log('Validation failed for step:', currentStep);
        }
    });

    prevBtn.addEventListener('click', () => {
        console.log('Previous button clicked. Current step:', currentStep);
        currentStep--;
        showStep(currentStep);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submission attempted');
        
        try {
            if (validateStep(currentStep)) {
                // Collect form data
                const formData = new FormData(form);
                const data = {
                    personalInfo: {
                        firstName: formData.get('firstName'),
                        lastName: formData.get('lastName'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        gender: formData.get('gender'),
                        dob: formData.get('dob')
                    },
                    skills: {
                        category: formData.get('primaryCategory'),
                        primary: formData.get('primarySkill'),
                        additional: Array.from(document.querySelectorAll('.skill-tag.selected')).map(tag => tag.dataset.skill),
                        experience: formData.get('experience'),
                        availability: Array.from(document.querySelectorAll('.time-slot.selected')).map(slot => ({
                            day: slot.closest('.day-column').querySelector('.day-label').textContent,
                            time: slot.dataset.time
                        }))
                    },
                    location: {
                        address: formData.get('address'),
                        city: formData.get('city'),
                        state: formData.get('state')
                    },
                    bio: formData.get('bio')
                };

                console.log('Form data collected:', data);

                // Store in localStorage
                const workers = JSON.parse(localStorage.getItem('workers') || '[]');
                workers.push({
                    id: Date.now(),
                    ...data,
                    createdAt: new Date().toISOString(),
                    ratings: [],
                    averageRating: 0,
                    reviews: [],
                    badges: ['New Worker']
                });
                localStorage.setItem('workers', JSON.stringify(workers));
                console.log('Data saved to localStorage');

                // Show success message and redirect
                showSuccessMessage();
                setTimeout(() => {
                    window.location.href = '/pages/login.html';
                }, 2000);
            }
        } catch (error) {
            console.error('Error saving data:', error);
            showErrorMessage('An error occurred while saving your registration. Please try again.');
        }
    });

    function showSuccessMessage() {
        const existingMessage = form.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Registration successful! Redirecting to login...</span>
        `;
        form.insertBefore(message, form.firstChild);
        console.log('Success message displayed');
    }

    function showErrorMessage(text) {
        const existingMessage = form.querySelector('.alert-error');
        if (existingMessage) {
            existingMessage.remove();
        }

        const message = document.createElement('div');
        message.className = 'alert alert-error';
        message.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${text}</span>
        `;
        form.insertBefore(message, form.firstChild);
        console.log('Error message displayed:', text);
    }

    // Initialize the form
    initForm();
}); 