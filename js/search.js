document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchKeyword = document.getElementById('searchKeyword');
    const searchButton = document.getElementById('searchButton');
    const skillFilter = document.getElementById('skillFilter');
    const locationFilter = document.getElementById('locationFilter');
    const availabilityFilter = document.getElementById('availabilityFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const sortBy = document.getElementById('sortBy');
    const workerGrid = document.getElementById('workerGrid');
    const loadingState = document.getElementById('loadingState');
    const noResults = document.getElementById('noResults');
    const loadMore = document.getElementById('loadMore');
    const activeFilters = document.getElementById('activeFilters');
    const workerModal = document.getElementById('workerModal');
    const modalClose = workerModal.querySelector('.modal-close');
    const workerCardTemplate = document.getElementById('workerCardTemplate');

    // State
    let workers = [];
    let filteredWorkers = [];
    let currentPage = 1;
    const workersPerPage = 12;
    let activeFilterTags = new Set();

    // Initialize
    const init = async () => {
        await loadWorkers();
        populateLocationFilter();
        setupEventListeners();
        applyFilters();
    };

    // Load workers from localStorage (mock data)
    const loadWorkers = async () => {
        showLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get workers from localStorage or create mock data
        workers = JSON.parse(localStorage.getItem('workers')) || createMockWorkers();
        localStorage.setItem('workers', JSON.stringify(workers));

        showLoading(false);
    };

    // Create mock worker data
    const createMockWorkers = () => {
        const skills = [
            // Construction
            'mason', 'plumber', 'electrician', 'tile_setter', 'welder', 'fabricator',
            // Woodwork
            'carpenter', 'furniture_maker', 'wood_polisher',
            // Metalwork
            'blacksmith', 'sheet_metal', 'fitter',
            // Painting & Finishing
            'painter', 'pop_designer', 'wallpaper_expert',
            // Home Services
            'cleaner', 'cook', 'housekeeper', 'pest_control'
        ];
        const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];
        const mockWorkers = [];

        for (let i = 1; i <= 50; i++) {
            const skill = skills[Math.floor(Math.random() * skills.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            const rating = (3 + Math.random() * 2).toFixed(1);
            const startHour = 6 + Math.floor(Math.random() * 6);

            mockWorkers.push({
                id: `worker_${i}`,
                name: `Worker ${i}`,
                skill: skill,
                location: location,
                rating: parseFloat(rating),
                ratingCount: Math.floor(Math.random() * 100) + 10,
                experience: Math.floor(Math.random() * 15) + 1,
                startTime: `${startHour}:00`,
                endTime: `${startHour + 8}:00`,
                completedJobs: Math.floor(Math.random() * 100) + 20,
                hourlyRate: Math.floor(Math.random() * 500) + 200,
                avatar: `https://i.pravatar.cc/150?img=${i}`,
                availability: startHour < 12 ? 'morning' : startHour < 18 ? 'afternoon' : 'evening'
            });
        }

        return mockWorkers;
    };

    // Populate location filter with unique locations
    const populateLocationFilter = () => {
        const locations = [...new Set(workers.map(worker => worker.location))].sort();
        locationFilter.innerHTML = '<option value="">All Locations</option>' +
            locations.map(location => `<option value="${location}">${location}</option>`).join('');
    };

    // Setup event listeners
    const setupEventListeners = () => {
        // Search and filter events
        searchButton.addEventListener('click', () => {
            currentPage = 1;
            applyFilters();
        });

        searchKeyword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentPage = 1;
                applyFilters();
            }
        });

        [skillFilter, locationFilter, availabilityFilter, ratingFilter, sortBy].forEach(filter => {
            filter.addEventListener('change', () => {
                currentPage = 1;
                applyFilters();
                updateActiveFilters();
            });
        });

        // Load more button
        loadMore.querySelector('button').addEventListener('click', () => {
            currentPage++;
            displayWorkers(filteredWorkers);
        });

        // Modal events
        modalClose.addEventListener('click', () => closeModal());
        workerModal.addEventListener('click', (e) => {
            if (e.target === workerModal) closeModal();
        });

        // Worker card actions
        workerGrid.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const workerId = button.closest('.worker-card').dataset.id;
            const worker = workers.find(w => w.id === workerId);

            if (button.dataset.action === 'view') {
                showWorkerDetails(worker);
            } else if (button.dataset.action === 'hire') {
                hireWorker(worker);
            }
        });

        // Active filter removal
        activeFilters.addEventListener('click', (e) => {
            const removeButton = e.target.closest('button');
            if (!removeButton) return;

            const filterId = removeButton.parentElement.dataset.filterId;
            const [filterType, value] = filterId.split(':');
            
            // Reset the corresponding filter
            document.getElementById(filterType).value = '';
            activeFilterTags.delete(filterId);
            
            currentPage = 1;
            applyFilters();
        });
    };

    // Apply filters and search
    const applyFilters = () => {
        const keyword = searchKeyword.value.toLowerCase();
        const skill = skillFilter.value;
        const location = locationFilter.value;
        const availability = availabilityFilter.value;
        const minRating = ratingFilter.value ? parseFloat(ratingFilter.value) : 0;

        filteredWorkers = workers.filter(worker => {
            const matchesKeyword = !keyword ||
                worker.name.toLowerCase().includes(keyword) ||
                worker.skill.toLowerCase().includes(keyword);
            const matchesSkill = !skill || worker.skill === skill;
            const matchesLocation = !location || worker.location === location;
            const matchesAvailability = !availability || worker.availability === availability;
            const matchesRating = worker.rating >= minRating;

            return matchesKeyword && matchesSkill && matchesLocation && 
                   matchesAvailability && matchesRating;
        });

        // Apply sorting
        const sortValue = sortBy.value;
        filteredWorkers.sort((a, b) => {
            switch (sortValue) {
                case 'rating':
                    return b.rating - a.rating;
                case 'experience':
                    return b.experience - a.experience;
                case 'availability':
                    return a.startTime.localeCompare(b.startTime);
                default:
                    return 0;
            }
        });

        displayWorkers(filteredWorkers);
        updateActiveFilters();
    };

    // Update active filters display
    const updateActiveFilters = () => {
        const filters = {
            skillFilter: 'Skill',
            locationFilter: 'Location',
            availabilityFilter: 'Availability',
            ratingFilter: 'Rating'
        };

        activeFilters.innerHTML = '';
        Object.entries(filters).forEach(([filterId, label]) => {
            const value = document.getElementById(filterId).value;
            if (value) {
                const displayValue = filterId === 'ratingFilter' ? `${value}+ Stars` : value;
                const tag = document.createElement('div');
                tag.className = 'filter-tag';
                tag.dataset.filterId = `${filterId}:${value}`;
                tag.innerHTML = `
                    ${label}: ${displayValue}
                    <button type="button">&times;</button>
                `;
                activeFilters.appendChild(tag);
            }
        });
    };

    // Display workers
    const displayWorkers = (workers) => {
        const start = (currentPage - 1) * workersPerPage;
        const end = start + workersPerPage;
        const hasMore = end < workers.length;

        // Update results count
        document.getElementById('resultCount').textContent = workers.length;

        // Show/hide no results message
        noResults.style.display = workers.length === 0 ? 'block' : 'none';

        // Clear grid if it's the first page
        if (currentPage === 1) {
            workerGrid.innerHTML = '';
        }

        // Display workers
        workers.slice(start, end).forEach(worker => {
            const card = workerCardTemplate.content.cloneNode(true);
            const workerCard = card.querySelector('.worker-card');
            
            workerCard.dataset.id = worker.id;
            card.querySelector('.worker-avatar img').src = worker.avatar;
            card.querySelector('.worker-name').textContent = worker.name;
            
            // Set rating stars
            const starsContainer = card.querySelector('.stars');
            starsContainer.innerHTML = Array.from({ length: 5 }, (_, i) => `
                <i class="fas fa-star${i < Math.floor(worker.rating) ? '' : 
                   i < worker.rating ? '-half-alt' : '-regular'}"></i>
            `).join('');
            
            card.querySelector('.rating-count').textContent = `(${worker.ratingCount})`;
            card.querySelector('.worker-skill span').textContent = 
                worker.skill.charAt(0).toUpperCase() + worker.skill.slice(1);
            card.querySelector('.worker-location span').textContent = worker.location;
            card.querySelector('.worker-experience span').textContent = 
                `${worker.experience} years`;
            card.querySelector('.worker-availability span').textContent = 
                `${worker.startTime} - ${worker.endTime}`;

            workerGrid.appendChild(card);
        });

        // Show/hide load more button
        loadMore.style.display = hasMore ? 'block' : 'none';
    };

    // Show worker details in modal
    const showWorkerDetails = (worker) => {
        const modalBody = workerModal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="worker-details">
                <div class="worker-detail-header">
                    <div class="worker-detail-avatar">
                        <img src="${worker.avatar}" alt="${worker.name}">
                    </div>
                    <div class="worker-detail-info">
                        <h2>${worker.name}</h2>
                        <div class="worker-rating">
                            <div class="stars">
                                ${Array.from({ length: 5 }, (_, i) => `
                                    <i class="fas fa-star${i < Math.floor(worker.rating) ? '' : 
                                       i < worker.rating ? '-half-alt' : '-regular'}"></i>
                                `).join('')}
                            </div>
                            <span>(${worker.ratingCount} reviews)</span>
                        </div>
                    </div>
                </div>

                <div class="worker-stats">
                    <div class="stat-card">
                        <div class="stat-value">${worker.experience}</div>
                        <div class="stat-label">Years Experience</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${worker.completedJobs}</div>
                        <div class="stat-label">Jobs Completed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">₹${worker.hourlyRate}</div>
                        <div class="stat-label">Per Hour</div>
                    </div>
                </div>

                <div class="worker-detail-body">
                    <h3>Availability</h3>
                    <p><i class="fas fa-clock"></i> ${worker.startTime} - ${worker.endTime}</p>
                    <p><i class="fas fa-location-dot"></i> ${worker.location}</p>
                </div>
            </div>
        `;

        workerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // Close modal
    const closeModal = () => {
        workerModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Hire worker
    const hireWorker = (worker) => {
        // Check if user is logged in
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please log in to hire workers');
            window.location.href = 'login.html';
            return;
        }

        // Redirect to job posting page with pre-filled worker details
        const params = new URLSearchParams({
            worker: worker.id,
            skill: worker.skill,
            name: worker.name
        });
        window.location.href = `post-job.html?${params.toString()}`;
    };

    // Show/hide loading state
    const showLoading = (show) => {
        loadingState.style.display = show ? 'block' : 'none';
        if (show) {
            workerGrid.innerHTML = '';
            loadMore.style.display = 'none';
            noResults.style.display = 'none';
        }
    };

    // Initialize the page
    init();
}); 