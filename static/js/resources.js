document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const searchInput = document.getElementById('resourceSearch');
    const sortSelect = document.getElementById('sortSelect');
    
    // Set up search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterResources();
        });
    }
    
    // Set up sorting functionality
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortResources(this.value);
        });
        
        // Initial sort (default to name A-Z)
        sortResources('name-asc');
    }
    
    // Optional: Animate cards on load
    const resourceCards = document.querySelectorAll('.resource-card');
    
    if (resourceCards.length > 0) {
        // Add animation class to cards with a delay for each
        resourceCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 50);
        });
    }
});

// Function to filter resources based on search term
function filterResources() {
    const searchTerm = document.getElementById('resourceSearch').value.toLowerCase();
    const resourceItems = document.querySelectorAll('.resource-item');
    
    resourceItems.forEach(item => {
        const name = item.dataset.name || '';
        const role = item.dataset.role || '';
        const dept = item.dataset.dept || '';
        
        // Search in name, role, and department
        if (name.includes(searchTerm) || role.includes(searchTerm) || dept.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show/hide department sections if all resources are hidden
    const departmentSections = document.querySelectorAll('.department-section');
    departmentSections.forEach(section => {
        const visibleResources = section.querySelectorAll('.resource-item:not([style*="display: none"])').length;
        section.style.display = visibleResources === 0 ? 'none' : '';
    });
}

// Function to sort resources
function sortResources(sortBy) {
    // Get all resource containers
    const containers = document.querySelectorAll('.resource-container');
    
    containers.forEach(container => {
        // Get all resource items in this container
        const items = Array.from(container.querySelectorAll('.resource-item'));
        
        // Sort items based on selected criteria
        items.sort((a, b) => {
            let valueA, valueB;
            
            switch(sortBy) {
                case 'name-asc':
                    return a.dataset.name.localeCompare(b.dataset.name);
                
                case 'name-desc':
                    return b.dataset.name.localeCompare(a.dataset.name);
                
                case 'utilization-desc':
                    valueA = parseFloat(a.dataset.utilization || 0);
                    valueB = parseFloat(b.dataset.utilization || 0);
                    return valueB - valueA; // Higher utilization first
                
                case 'utilization-asc':
                    valueA = parseFloat(a.dataset.utilization || 0);
                    valueB = parseFloat(b.dataset.utilization || 0);
                    return valueA - valueB; // Lower utilization first
                
                case 'projects-desc':
                    valueA = parseInt(a.dataset.projects || 0);
                    valueB = parseInt(b.dataset.projects || 0);
                    return valueB - valueA; // More projects first
                
                case 'projects-asc':
                    valueA = parseInt(a.dataset.projects || 0);
                    valueB = parseInt(b.dataset.projects || 0);
                    return valueA - valueB; // Fewer projects first
                
                default:
                    return 0;
            }
        });
        
        // Re-append items to container in the new order
        items.forEach(item => {
            container.appendChild(item);
        });
    });
    
    // Update sort icon in the select dropdown
    updateSortIcon(sortBy);
}

// Function to update sort icon based on selected sort
function updateSortIcon(sortBy) {
    const sortIconContainer = document.querySelector('.input-group-text i');
    
    if (sortIconContainer) {
        // Remove existing sort icons
        sortIconContainer.classList.remove('bi-sort-alpha-down', 'bi-sort-alpha-up', 'bi-sort-numeric-down', 'bi-sort-numeric-up');
        
        // Add appropriate icon based on sort type
        if (sortBy === 'name-asc') {
            sortIconContainer.classList.add('bi-sort-alpha-down');
        } else if (sortBy === 'name-desc') {
            sortIconContainer.classList.add('bi-sort-alpha-up');
        } else if (sortBy.includes('-desc')) {
            sortIconContainer.classList.add('bi-sort-numeric-down');
        } else {
            sortIconContainer.classList.add('bi-sort-numeric-up');
        }
    }
}

// Add some CSS for animation
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .fade-in {
            animation: fadeIn 0.5s ease-in-out forwards;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .resource-card {
            opacity: 0;
        }
    </style>
`);