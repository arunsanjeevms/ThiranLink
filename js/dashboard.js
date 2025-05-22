document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const userMenuButton = document.getElementById('userMenuButton');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const logoutButton = document.getElementById('logoutButton');
    const workerDashboard = document.getElementById('workerDashboard');
    const customerDashboard = document.getElementById('customerDashboard');
    const toggleAvailability = document.getElementById('toggleAvailability');
    const jobRequests = document.getElementById('jobRequests');
    const jobList = document.getElementById('jobList');
    const jobModal = document.getElementById('jobModal');
    const modalClose = jobModal.querySelector('.modal-close');
    const jobRequestTemplate = document.getElementById('jobRequestTemplate');
    const jobCardTemplate = document.getElementById('jobCardTemplate');

    // State
    let currentUser = null;
    let jobs = [];
    let currentFilter = 'pending';

    // Initialize
    const init = async () => {
        // Check if user is logged in
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Setup user menu
        setupUserMenu();

        // Load jobs
        await loadJobs();

        // Show appropriate dashboard
        if (currentUser.type === 'worker') {
            workerDashboard.style.display = 'block';
            setupWorkerDashboard();
        } else {
            customerDashboard.style.display = 'block';
            setupCustomerDashboard();
        }

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

    // Load jobs from localStorage
    const loadJobs = async () => {
        jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    };

    // Setup worker dashboard
    const setupWorkerDashboard = () => {
        // Update stats
        updateWorkerStats();

        // Setup availability toggle
        const isAvailable = localStorage.getItem(`worker_${currentUser.id}_available`) === 'true';
        toggleAvailability.classList.toggle('active', isAvailable);
        toggleAvailability.querySelector('span').textContent = 
            isAvailable ? 'Available for Work' : 'Not Available';

        // Display job requests
        displayJobRequests();
    };

    // Update worker stats
    const updateWorkerStats = () => {
        const workerJobs = jobs.filter(job => job.workerId === currentUser.id);
        const completedJobs = workerJobs.filter(job => job.status === 'completed');
        
        document.getElementById('completedJobs').textContent = completedJobs.length;
        
        if (completedJobs.length > 0) {
            const totalRating = completedJobs.reduce((sum, job) => sum + (job.rating || 0), 0);
            const averageRating = (totalRating / completedJobs.length).toFixed(1);
            document.getElementById('averageRating').textContent = averageRating;
        }

        const totalEarnings = completedJobs.reduce((sum, job) => sum + job.payment, 0);
        document.getElementById('totalEarnings').textContent = `₹${totalEarnings}`;
    };

    // Setup customer dashboard
    const setupCustomerDashboard = () => {
        // Update stats
        updateCustomerStats();

        // Display jobs
        displayJobs();
    };

    // Update customer stats
    const updateCustomerStats = () => {
        const customerJobs = jobs.filter(job => job.customerId === currentUser.id);
        const activeJobs = customerJobs.filter(job => job.status === 'accepted');
        const completedJobs = customerJobs.filter(job => job.status === 'completed');

        document.getElementById('totalJobs').textContent = customerJobs.length;
        document.getElementById('activeJobs').textContent = activeJobs.length;
        document.getElementById('completedJobsCustomer').textContent = completedJobs.length;
    };

    // Display job requests for workers
    const displayJobRequests = () => {
        const relevantJobs = jobs.filter(job => 
            job.category === currentUser.skill && 
            (currentFilter === 'all' || job.status === currentFilter)
        );

        jobRequests.innerHTML = '';
        const noJobs = document.getElementById('noJobs');

        if (relevantJobs.length === 0) {
            noJobs.style.display = 'block';
            return;
        }

        noJobs.style.display = 'none';
        relevantJobs.forEach(job => {
            const card = jobRequestTemplate.content.cloneNode(true);
            const jobCard = card.querySelector('.job-request-card');

            // Set job data
            jobCard.dataset.id = job.id;
            card.querySelector('.customer-avatar img').src = job.customerAvatar;
            card.querySelector('.customer-name').textContent = job.customerName;
            card.querySelector('.job-date').textContent = new Date(job.createdAt).toLocaleDateString();
            card.querySelector('.job-location').textContent = job.location;
            card.querySelector('.job-status').textContent = job.status;
            card.querySelector('.job-status').className = `job-status ${job.status}`;
            card.querySelector('.job-title').textContent = job.title;
            card.querySelector('.job-description').textContent = job.description;
            card.querySelector('.preferred-date').textContent = job.date;
            card.querySelector('.preferred-time').textContent = job.time;
            card.querySelector('.budget').textContent = `₹${job.budgetMin} - ₹${job.budgetMax}`;

            // Show/hide buttons based on status
            const acceptButton = card.querySelector('[data-action="accept"]');
            acceptButton.style.display = job.status === 'pending' ? 'block' : 'none';

            jobRequests.appendChild(card);
        });

        // Update filter counts
        document.querySelectorAll('.content-filters button').forEach(button => {
            const filter = button.dataset.filter;
            const count = jobs.filter(job => 
                job.category === currentUser.skill && job.status === filter
            ).length;
            button.textContent = `${filter.charAt(0).toUpperCase() + filter.slice(1)} (${count})`;
        });
    };

    // Display jobs for customers
    const displayJobs = () => {
        const customerJobs = jobs.filter(job => 
            job.customerId === currentUser.id &&
            (currentFilter === 'all' || job.status === currentFilter)
        );

        jobList.innerHTML = '';
        const noJobs = document.getElementById('noJobsCustomer');

        if (customerJobs.length === 0) {
            noJobs.style.display = 'block';
            return;
        }

        noJobs.style.display = 'none';
        customerJobs.forEach(job => {
            const card = jobCardTemplate.content.cloneNode(true);
            const jobCard = card.querySelector('.job-card');

            // Set job data
            jobCard.dataset.id = job.id;
            card.querySelector('.job-title').textContent = job.title;
            card.querySelector('.job-status').textContent = job.status;
            card.querySelector('.job-status').className = `job-status ${job.status}`;
            card.querySelector('.job-category').textContent = 
                job.category.charAt(0).toUpperCase() + job.category.slice(1);
            card.querySelector('.job-date').textContent = job.date;
            card.querySelector('.job-location').textContent = job.location;

            if (job.workerId) {
                const worker = JSON.parse(localStorage.getItem('workers'))[job.workerId];
                card.querySelector('.worker-avatar img').src = worker.avatar;
                card.querySelector('.worker-name').textContent = worker.name;
                
                // Set rating stars
                const starsContainer = card.querySelector('.stars');
                starsContainer.innerHTML = Array.from({ length: 5 }, (_, i) => `
                    <i class="fas fa-star${i < Math.floor(worker.rating) ? '' : 
                       i < worker.rating ? '-half-alt' : '-regular'}"></i>
                `).join('');
                
                card.querySelector('.rating-count').textContent = `(${worker.ratingCount})`;
            } else {
                card.querySelector('.worker-info').style.display = 'none';
            }

            // Show/hide buttons based on status
            const completeButton = card.querySelector('[data-action="complete"]');
            completeButton.style.display = job.status === 'accepted' ? 'block' : 'none';

            jobList.appendChild(card);
        });

        // Update filter counts
        document.querySelectorAll('.content-filters button').forEach(button => {
            const filter = button.dataset.filter;
            const count = jobs.filter(job => 
                job.customerId === currentUser.id && job.status === filter
            ).length;
            button.textContent = `${filter.charAt(0).toUpperCase() + filter.slice(1)} (${count})`;
        });
    };

    // Setup event listeners
    const setupEventListeners = () => {
        // Availability toggle
        if (toggleAvailability) {
            toggleAvailability.addEventListener('click', () => {
                const isAvailable = toggleAvailability.classList.toggle('active');
                toggleAvailability.querySelector('span').textContent = 
                    isAvailable ? 'Available for Work' : 'Not Available';
                localStorage.setItem(`worker_${currentUser.id}_available`, isAvailable);
            });
        }

        // Filter buttons
        document.querySelectorAll('.content-filters button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelector('.content-filters button.active')?.classList.remove('active');
                button.classList.add('active');
                currentFilter = button.dataset.filter;
                if (currentUser.type === 'worker') {
                    displayJobRequests();
                } else {
                    displayJobs();
                }
            });
        });

        // Job actions
        const handleJobAction = async (jobId, action) => {
            const job = jobs.find(j => j.id === jobId);
            if (!job) return;

            switch (action) {
                case 'view':
                    showJobDetails(job);
                    break;
                case 'accept':
                    if (confirm('Are you sure you want to accept this job?')) {
                        job.status = 'accepted';
                        job.workerId = currentUser.id;
                        localStorage.setItem('jobs', JSON.stringify(jobs));
                        if (currentUser.type === 'worker') {
                            displayJobRequests();
                        } else {
                            displayJobs();
                        }
                    }
                    break;
                case 'complete':
                    if (confirm('Are you sure you want to mark this job as completed?')) {
                        job.status = 'completed';
                        job.completedAt = new Date().toISOString();
                        localStorage.setItem('jobs', JSON.stringify(jobs));
                        if (currentUser.type === 'worker') {
                            displayJobRequests();
                            updateWorkerStats();
                        } else {
                            displayJobs();
                            updateCustomerStats();
                        }
                    }
                    break;
            }
        };

        // Job card click events
        [jobRequests, jobList].forEach(container => {
            if (container) {
                container.addEventListener('click', (e) => {
                    const button = e.target.closest('button[data-action]');
                    if (!button) return;

                    const jobCard = button.closest('.job-request-card, .job-card');
                    const jobId = jobCard.dataset.id;
                    const action = button.dataset.action;

                    handleJobAction(jobId, action);
                });
            }
        });

        // Modal events
        modalClose.addEventListener('click', () => closeJobModal());
        jobModal.addEventListener('click', (e) => {
            if (e.target === jobModal) closeJobModal();
        });
    };

    // Show job details in modal
    const showJobDetails = (job) => {
        const modalBody = jobModal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="job-details">
                <h4>${job.title}</h4>
                <div class="detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${job.location}</span>
                </div>
                <div class="detail">
                    <i class="fas fa-calendar"></i>
                    <span>${job.date}</span>
                </div>
                <div class="detail">
                    <i class="fas fa-clock"></i>
                    <span>${job.time}</span>
                </div>
                <div class="detail">
                    <i class="fas fa-rupee-sign"></i>
                    <span>₹${job.budgetMin} - ₹${job.budgetMax}</span>
                </div>
                <h5>Description</h5>
                <p>${job.description}</p>
                ${job.additionalNotes ? `
                    <h5>Additional Notes</h5>
                    <p>${job.additionalNotes}</p>
                ` : ''}
                ${job.images?.length ? `
                    <h5>Images</h5>
                    <div class="job-images">
                        ${job.images.map(image => `
                            <img src="${image}" alt="Job Image">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        const acceptButton = jobModal.querySelector('[data-action="accept"]');
        acceptButton.style.display = job.status === 'pending' ? 'block' : 'none';
        acceptButton.onclick = () => handleJobAction(job.id, 'accept');

        jobModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // Close job modal
    const closeJobModal = () => {
        jobModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Initialize the page
    init();
}); 