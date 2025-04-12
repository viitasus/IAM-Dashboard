document.addEventListener('DOMContentLoaded', function() {
    // Create the charts as soon as the DOM is ready
    createCharts();
    
    // Add resize handler for responsive charts
    window.addEventListener('resize', function() {
        Plotly.Plots.resize('allocation_pie_chart');
        Plotly.Plots.resize('utilization_bar_chart');
    });
    
    // Set up modal for data display
    setupDataModal();
    
    // Add export functionality for the projects table
    const exportProjectsBtn = document.getElementById('exportProjectsBtn');
    if (exportProjectsBtn) {
        exportProjectsBtn.addEventListener('click', exportProjectsTable);
    }
});

function createCharts() {
    // Create allocation pie chart
    createAllocationPieChart();
    
    // Create utilization bar chart
    createUtilizationBarChart();
}

function createAllocationPieChart() {
    const pieChartElement = document.getElementById('allocation_pie_chart');
    
    if (!pieChartElement) return;
    
    // Filter projects with allocation data
    const projectsWithAllocation = chartData.projects.filter(p => p.allocated > 0);
    
    // Skip creating the chart if no allocation data
    if (projectsWithAllocation.length === 0) {
        pieChartElement.innerHTML = '<div class="alert alert-info text-center">No allocation data available</div>';
        return;
    }
    
    const pieData = {
        type: 'pie',
        labels: projectsWithAllocation.map(p => p.name),
        values: projectsWithAllocation.map(p => p.allocated),
        hole: 0.4,
        textinfo: 'label+percent',
        insidetextorientation: 'radial',
        hoverinfo: 'label+value+percent',
        marker: {
            colors: generateColors(projectsWithAllocation.length)
        }
    };
    
    const pieLayout = {
        margin: { t: 10, b: 10, l: 10, r: 10 },
        showlegend: true,
        legend: { orientation: 'h', y: -0.2 },
        autosize: true,
        title: {
            text: 'Click on segments to view data',
            font: {
                size: 12,
                color: '#777'
            },
            y: 0.98
        }
    };
    
    Plotly.newPlot('allocation_pie_chart', [pieData], pieLayout, { responsive: true });
    
    // Add click event to show data table
    pieChartElement.on('plotly_click', function(data) {
        const tableData = projectsWithAllocation.map((project, index) => {
            return {
                Project: project.name,
                'Allocated Days': project.allocated,
                'Percentage': ((project.allocated / projectsWithAllocation.reduce((sum, p) => sum + p.allocated, 0)) * 100).toFixed(1) + '%',
                highlighted: data.points[0].pointIndex === index
            };
        });
        
        showDataTable('Project Allocation Distribution', tableData);
    });
}

function createUtilizationBarChart() {
    const barChartElement = document.getElementById('utilization_bar_chart');
    
    if (!barChartElement) return;
    
    // Filter projects with both allocation and utilization data
    const projectsWithData = chartData.projects.filter(p => p.allocated > 0 || p.utilized > 0);
    
    // Skip creating the chart if no utilization data
    if (projectsWithData.length === 0) {
        barChartElement.innerHTML = '<div class="alert alert-info text-center">No utilization data available</div>';
        return;
    }
    
    const colors = generateColors(2); // Just need 2 colors for allocated and utilized
    
    const barData = [
        {
            x: projectsWithData.map(p => p.name),
            y: projectsWithData.map(p => p.allocated),
            type: 'bar',
            name: 'Allocated',
            marker: { color: colors[0] }
        },
        {
            x: projectsWithData.map(p => p.name),
            y: projectsWithData.map(p => p.utilized),
            type: 'bar',
            name: 'Utilized',
            marker: { color: colors[1] }
        }
    ];
    
    const barLayout = {
        margin: { t: 30, b: 80, l: 60, r: 10 },
        showlegend: true,
        barmode: 'group',
        xaxis: {
            tickangle: -45,
            automargin: true
        },
        yaxis: {
            title: 'Days'
        },
        legend: { orientation: 'h', y: -0.2 },
        autosize: true,
        title: {
            text: 'Click on bars to view data',
            font: {
                size: 12,
                color: '#777'
            },
            y: 0.98
        }
    };
    
    Plotly.newPlot('utilization_bar_chart', barData, barLayout, { responsive: true });
    
    // Add click event to show data table
    barChartElement.on('plotly_click', function(data) {
        const clickedX = data.points[0].x;
        
        const tableData = projectsWithData.map(project => {
            const utilizationRate = project.allocated > 0 
                ? ((project.utilized / project.allocated) * 100).toFixed(1) + '%'
                : 'N/A';
                
            return {
                Project: project.name,
                'Allocated Days': project.allocated,
                'Utilized Days': project.utilized,
                'Utilization Rate': utilizationRate,
                'Remaining Days': (project.allocated - project.utilized).toFixed(1),
                highlighted: project.name === clickedX
            };
        });
        
        showDataTable('Project Utilization Comparison', tableData);
    });
}

// Function to export the projects table
function exportProjectsTable() {
    const projectsTable = document.querySelector('.project-table');
    
    if (!projectsTable) return;
    
    // Extract table headers
    const headerRow = projectsTable.querySelector('thead tr');
    const headers = Array.from(headerRow.querySelectorAll('th')).map(th => th.textContent.trim());
    
    // Extract table data
    const bodyRows = projectsTable.querySelectorAll('tbody tr');
    const data = [];
    
    bodyRows.forEach(row => {
        const rowData = {};
        
        // Process each cell
        Array.from(row.querySelectorAll('td')).forEach((cell, index) => {
            let value;
            
            // Special handling for engagement type (badge)
            if (index === 1) {
                value = cell.textContent.trim();
            } 
            // Special handling for utilization rate (progress bar)
            else if (index === 4 && cell.querySelector('.progress-bar')) {
                value = cell.querySelector('.progress-bar').textContent.trim();
            }
            // Default handling
            else {
                value = cell.textContent.trim();
            }
            
            rowData[headers[index]] = value;
        });
        
        data.push(rowData);
    });
    
    // Get resource name from page title
    const resourceName = document.querySelector('.dashboard-title').textContent.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${resourceName}_projects.csv`;
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            
            // Handle commas in text and quote strings
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            
            return value;
        });
        
        csvContent += values.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper function to generate colors for charts
function generateColors(count) {
    const baseColors = [
        '#4e73df', // Primary blue
        '#1cc88a', // Success green
        '#f6c23e', // Warning yellow
        '#e74a3b', // Danger red
        '#36b9cc', // Info cyan
        '#6f42c1', // Purple
        '#fd7e14', // Orange
        '#20c997', // Teal
        '#6c757d'  // Gray
    ];
    
    // If we need more colors than in our base set, generate them
    if (count <= baseColors.length) {
        return baseColors.slice(0, count);
    } else {
        const colors = [...baseColors];
        
        // Generate additional colors with slight variations
        for (let i = baseColors.length; i < count; i++) {
            const hue = (i * 137) % 360; // Use golden ratio to space colors
            colors.push(`hsl(${hue}, 70%, 60%)`);
        }
        
        return colors;
    }
}

// Set up modal for displaying data
function setupDataModal() {
    // Create modal if it doesn't exist
    if (!document.getElementById('dataModal')) {
        const modalHTML = `
        <div class="modal fade" id="dataModal" tabindex="-1" aria-labelledby="dataModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="dataModalLabel">Chart Data</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div id="dataTableContainer" class="table-responsive">
                            <!-- Table will be inserted here -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" id="exportDataBtn">Export to CSV</button>
                    </div>
                </div>
            </div>
        </div>`;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Add export functionality
        document.getElementById('exportDataBtn').addEventListener('click', exportTableToCSV);
    }
}

// Function to show data table in modal
function showDataTable(title, data) {
    if (!data || data.length === 0) {
        alert('No data available for this chart.');
        return;
    }
    
    // Get modal elements
    const modal = document.getElementById('dataModal');
    const modalTitle = document.getElementById('dataModalLabel');
    const tableContainer = document.getElementById('dataTableContainer');
    
    // Set title
    modalTitle.textContent = title;
    
    // Create table
    const columns = Object.keys(data[0]).filter(key => key !== 'highlighted');
    
    let tableHTML = '<table class="table table-striped table-bordered">';
    
    // Header
    tableHTML += '<thead><tr>';
    columns.forEach(column => {
        tableHTML += `<th>${column}</th>`;
    });
    tableHTML += '</tr></thead>';
    
    // Body
    tableHTML += '<tbody>';
    data.forEach(row => {
        tableHTML += row.highlighted ? '<tr class="table-primary">' : '<tr>';
        columns.forEach(column => {
            const value = row[column];
            if (typeof value === 'number') {
                tableHTML += `<td>${value.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>`;
            } else {
                tableHTML += `<td>${value}</td>`;
            }
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody>';
    tableHTML += '</table>';
    
    // Set table HTML
    tableContainer.innerHTML = tableHTML;
    
    // Show modal using Bootstrap
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Store the current data for export
    window.currentModalData = {
        title: title,
        data: data
    };
}

// Function to export table data to CSV
function exportTableToCSV() {
    if (!window.currentModalData) return;
    
    const { title, data } = window.currentModalData;
    const filename = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.csv';
    
    // Get columns (exclude 'highlighted')
    const columns = Object.keys(data[0]).filter(col => col !== 'highlighted');
    
    // Create CSV content
    let csvContent = columns.join(',') + '\n';
    
    data.forEach(row => {
        const values = columns.map(column => {
            const value = row[column];
            
            // Handle commas in text and quote strings
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            
            return value;
        });
        
        csvContent += values.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}