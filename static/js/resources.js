document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('resourceSearch');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
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
        });
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
    
    // Optional: Add sorting functionality
    setupSorting();
});

function setupSorting() {
    // Add sort buttons if needed
    const sortButtons = document.querySelectorAll('[data-sort]');
    
    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sortBy = this.dataset.sort;
            sortResources(sortBy);
        });
    });
}

function sortResources(sortBy) {
    // Example sorting function
    const containers = document.querySelectorAll('.resource-container');
    
    containers.forEach(container => {
        const items = Array.from(container.querySelectorAll('.resource-item'));
        
        items.sort((a, b) => {
            let valueA, valueB;
            
            switch(sortBy) {
                case 'name':
                    valueA = a.dataset.name;
                    valueB = b.dataset.name;
                    return valueA.localeCompare(valueB);
                case 'role':
                    valueA = a.dataset.role;
                    valueB = b.dataset.role;
                    return valueA.localeCompare(valueB);
                case 'utilization':
                    valueA = parseFloat(a.querySelector('.utilization-bar')?.style.width || '0');
                    valueB = parseFloat(b.querySelector('.utilization-bar')?.style.width || '0');
                    return valueB - valueA; // Higher utilization first
                default:
                    return 0;
            }
        });
        
        // Reappend items in new order
        items.forEach(item => {
            container.appendChild(item);
        });
    });
}