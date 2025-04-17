document.addEventListener('DOMContentLoaded', function() {
    // Apply custom theme to Plotly charts
    applyCustomTheme();
    
    // Render all charts
    renderCharts();
    
    // Setup responsive behavior
    window.addEventListener('resize', function() {
        // Redraw charts on window resize with a slight delay to prevent excessive redraws
        if (window.resizeTimer) {
            clearTimeout(window.resizeTimer);
        }
        window.resizeTimer = setTimeout(function() {
            Plotly.Plots.resize(document.getElementById('resource_allocation_chart'));
            Plotly.Plots.resize(document.getElementById('utilization_gauge'));
            Plotly.Plots.resize(document.getElementById('billing_status_chart'));
            Plotly.Plots.resize(document.getElementById('milestone_status_chart'));
            Plotly.Plots.resize(document.getElementById('zoho_comparison_chart'));
        }, 250);
    });
    
    // Set up modal for data display
    setupDataModal();
    
    // Setup chart toolbar event handlers for Plotly buttons
    setupChartToolbarHandlers();
    
    // Add fade-in animation to chart containers
    animateCharts();
});

function applyCustomTheme() {
    // Custom theme for Plotly charts using RNS color scheme
    const rnsColors = [
        '#8b1d1d', // primary
        '#701717', // primary-dark
        '#a52525', // primary-light
        '#333333', // accent
        '#28a745', // success
        '#17a2b8', // info
        '#f6c23e', // warning
        '#dc3545'  // danger
    ];
    
    const axisStyle = {
        color: '#333333',
        gridcolor: '#e9ecef',
        linecolor: '#e9ecef',
        zerolinecolor: '#e9ecef'
    };
    
    Plotly.setPlotConfig({
        modeBarButtonsToRemove: ['sendDataToCloud', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'lasso2d', 'select2d'],
        displaylogo: false,
        responsive: true
    });
    
    window.customPlotlyLayout = {
        font: {
            family: "'Poppins', sans-serif",
            color: '#333333'
        },
        colorway: rnsColors,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: {
            l: 50,
            r: 50,
            t: 30,
            b: 50,
            pad: 4
        },
        xaxis: axisStyle,
        yaxis: axisStyle,
        legend: {
            bgcolor: 'rgba(255,255,255,0.5)',
            bordercolor: '#e9ecef',
            borderwidth: 1
        },
        hoverlabel: {
            bgcolor: '#fff',
            font: {
                family: "'Poppins', sans-serif",
                size: 12
            },
            bordercolor: '#e9ecef'
        }
    };
}

function renderCharts() {
    // Resource Allocation Chart
    if (chartData.resource_allocation_chart) {
        const resourceLayout = Object.assign({}, window.customPlotlyLayout, chartData.resource_allocation_chart.layout);
        
        // Enhance layout
        resourceLayout.height = 400;
        resourceLayout.margin.t = 10;
        
        Plotly.newPlot(
            'resource_allocation_chart', 
            chartData.resource_allocation_chart.data, 
            resourceLayout,
            {responsive: true, displayModeBar: true}
        );
        
        // Add click event
        document.getElementById('resource_allocation_chart').on('plotly_click', function(data) {
            showDataTable('Resource Allocation', convertChartToTableData(chartData.resource_allocation_chart, data));
        });
    }
    
    // Utilization Gauge
    if (chartData.utilization_gauge) {
        const gaugeLayout = Object.assign({}, window.customPlotlyLayout, chartData.utilization_gauge.layout);
        
        // Enhance gauge
        if (chartData.utilization_gauge.data && chartData.utilization_gauge.data[0]) {
            // Set gauge colors based on value
            const value = chartData.utilization_gauge.data[0].value;
            let gaugeColor = '#8b1d1d'; // default
            
            if (value < 50) {
                gaugeColor = '#dc3545'; // danger for low utilization
            } else if (value < 75) {
                gaugeColor = '#f6c23e'; // warning for moderate utilization
            } else {
                gaugeColor = '#28a745'; // success for high utilization
            }
            
            chartData.utilization_gauge.data[0].gauge = Object.assign({}, chartData.utilization_gauge.data[0].gauge, {
                bar: { color: gaugeColor },
                borderwidth: 2,
                bordercolor: '#e9ecef'
            });
        }
        
        gaugeLayout.height = 400;
        gaugeLayout.margin = { l: 30, r: 30, t: 30, b: 30 };
        
        Plotly.newPlot(
            'utilization_gauge', 
            chartData.utilization_gauge.data, 
            gaugeLayout,
            {responsive: true, displayModeBar: true}
        );
        
        // Add click event for gauge
        document.getElementById('utilization_gauge').on('plotly_click', function() {
            const gaugeData = [
                { Category: 'Utilization Rate', Value: chartData.utilization_gauge.data[0].value + '%' }
            ];
            showDataTable('Resource Utilization', gaugeData);
        });
    }
    
    // Billing Status Chart
    if (chartData.billing_status_chart) {
        const billingLayout = Object.assign({}, window.customPlotlyLayout, chartData.billing_status_chart.layout);
        
        // Enhance pie chart
        if (chartData.billing_status_chart.data && chartData.billing_status_chart.data[0]) {
            chartData.billing_status_chart.data[0] = Object.assign({}, chartData.billing_status_chart.data[0], {
                hole: 0.4,
                textinfo: 'label+percent',
                insidetextorientation: 'radial',
                insidetextfont: {
                    family: "'Poppins', sans-serif",
                    size: 12,
                    color: '#ffffff'
                },
                outsidetextfont: {
                    family: "'Poppins', sans-serif",
                    size: 12,
                    color: '#333333'
                },
                hoverinfo: 'label+value+percent',
                marker: {
                    line: {
                        color: '#ffffff',
                        width: 2
                    }
                }
            });
        }
        
        billingLayout.height = 400;
        billingLayout.margin = { l: 20, r: 20, t: 20, b: 20 };
        
        Plotly.newPlot(
            'billing_status_chart', 
            chartData.billing_status_chart.data, 
            billingLayout,
            {responsive: true, displayModeBar: true}
        );
        
        // Add click event
        document.getElementById('billing_status_chart').on('plotly_click', function(data) {
            showDataTable('Billing Status Distribution', convertChartToTableData(chartData.billing_status_chart, data));
        });
    }
    
    // Milestone Status Chart
    if (chartData.milestone_status_chart) {
        const milestoneLayout = Object.assign({}, window.customPlotlyLayout, chartData.milestone_status_chart.layout);
        
        // Enhance pie chart
        if (chartData.milestone_status_chart.data && chartData.milestone_status_chart.data[0]) {
            chartData.milestone_status_chart.data[0] = Object.assign({}, chartData.milestone_status_chart.data[0], {
                hole: 0.4,
                textinfo: 'label+percent',
                insidetextorientation: 'radial',
                insidetextfont: {
                    family: "'Poppins', sans-serif",
                    size: 12,
                    color: '#ffffff'
                },
                outsidetextfont: {
                    family: "'Poppins', sans-serif",
                    size: 12,
                    color: '#333333'
                },
                hoverinfo: 'label+value+percent',
                marker: {
                    line: {
                        color: '#ffffff',
                        width: 2
                    }
                }
            });
        }
        
        milestoneLayout.height = 400;
        milestoneLayout.margin = { l: 20, r: 20, t: 20, b: 20 };
        
        Plotly.newPlot(
            'milestone_status_chart', 
            chartData.milestone_status_chart.data, 
            milestoneLayout,
            {responsive: true, displayModeBar: true}
        );
        
        // Add click event
        document.getElementById('milestone_status_chart').on('plotly_click', function(data) {
            showDataTable('Milestone Status Distribution', convertChartToTableData(chartData.milestone_status_chart, data));
        });
    }
    
    // Zoho Comparison Chart
    if (chartData.zoho_comparison_chart) {
        const comparisonLayout = Object.assign({}, window.customPlotlyLayout, chartData.zoho_comparison_chart.layout);
        
        // Enhance bar chart
        comparisonLayout.height = 400;
        comparisonLayout.barmode = 'group';
        comparisonLayout.bargap = 0.15;
        comparisonLayout.bargroupgap = 0.1;
        
        if (chartData.zoho_comparison_chart.data) {
            chartData.zoho_comparison_chart.data.forEach((trace, index) => {
                // Add hover template
                chartData.zoho_comparison_chart.data[index] = Object.assign({}, trace, {
                    hovertemplate: '%{x}: %{y} days<extra>%{fullData.name}</extra>',
                    marker: {
                        line: {
                            width: 1,
                            color: '#ffffff'
                        }
                    }
                });
            });
        }
        
        Plotly.newPlot(
            'zoho_comparison_chart', 
            chartData.zoho_comparison_chart.data, 
            comparisonLayout,
            {responsive: true, displayModeBar: true}
        );
        
        // Add click event
        document.getElementById('zoho_comparison_chart').on('plotly_click', function(data) {
            showDataTable('Project Plan vs Zoho Comparison', convertChartToTableData(chartData.zoho_comparison_chart, data));
        });
    }
}

// Create modal for data display
function setupDataModal() {
    // Create modal element if it doesn't exist
    if (!document.getElementById('dataModal')) {
        const modalHtml = `
        <div class="modal fade" id="dataModal" tabindex="-1" aria-labelledby="dataModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="dataModalLabel">Chart Data</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover" id="modalDataTable">
                                <thead>
                                    <tr id="modalTableHeader"></tr>
                                </thead>
                                <tbody id="modalTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-primary" id="exportCsvBtn">
                            <i class="bi bi-download me-2"></i>Export CSV
                        </button>
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle me-2"></i>Close
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        
        // Append modal to body
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHtml;
        document.body.appendChild(modalDiv);
        
        // Set up the export CSV functionality
        document.getElementById('exportCsvBtn').addEventListener('click', function() {
            exportTableToCSV('chart_data.csv');
        });
    }
}

// Helper function to convert chart data to table format
function convertChartToTableData(chartData, clickEvent) {
    // Handle different chart types
    if (chartData.data[0].type === 'pie') {
        // For pie charts
        return chartData.data[0].values.map((val, idx) => {
            return {
                Category: chartData.data[0].labels[idx],
                Value: val,
                Percentage: (val / chartData.data[0].values.reduce((a, b) => a + b, 0) * 100).toFixed(1) + '%'
            };
        });
    } else if (chartData.data[0].type === 'bar') {
        // For bar charts with multiple traces
        const categories = chartData.data[0].x;
        return categories.map((category, idx) => {
            const rowData = { Category: category };
            chartData.data.forEach(trace => {
                rowData[trace.name] = trace.y[idx];
            });
            return rowData;
        });
    } else if (chartData.data[0].type === 'gauge') {
        // For gauge charts
        return [{ Category: 'Utilization', Value: chartData.data[0].value }];
    } else {
        // Default case
        return chartData.data.flatMap(trace => {
            return trace.x.map((xVal, i) => ({
                Name: trace.name,
                X: xVal,
                Y: trace.y[i]
            }));
        });
    }
}

// Function to show data in modal table
function showDataTable(title, data) {
    if (!data || data.length === 0) return;
    
    // Set modal title
    document.getElementById('dataModalLabel').textContent = title;
    
    // Get table elements
    const tableHeader = document.getElementById('modalTableHeader');
    const tableBody = document.getElementById('modalTableBody');
    
    // Clear existing content
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
    
    // Add headers based on the first data item's keys
    const headers = Object.keys(data[0]);
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        tableHeader.appendChild(th);
    });
    
    // Add data rows
    data.forEach(item => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = item[header];
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
    
    // Show the modal
    const dataModal = new bootstrap.Modal(document.getElementById('dataModal'));
    dataModal.show();
}

// Export table to CSV
function exportTableToCSV(filename) {
    const table = document.getElementById('modalDataTable');
    const rows = table.querySelectorAll('tr');
    
    // Prepare CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    rows.forEach(function(row) {
        const rowData = [];
        const cols = row.querySelectorAll('td, th');
        
        cols.forEach(function(col) {
            // Quote fields that contain commas
            let value = col.textContent;
            if (value.includes(',')) {
                value = `"${value}"`;
            }
            rowData.push(value);
        });
        
        csvContent += rowData.join(',') + '\r\n';
    });
    
    // Create download link and trigger click
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Enhanced toolbar handler function - add this to your dashboard.js file
function setupChartToolbarHandlers() {
    // Get all chart containers
    const chartContainers = document.querySelectorAll('.chart-container');
    
    // Add event listeners for when Plotly adds the toolbars
    chartContainers.forEach(container => {
        // Use MutationObserver to detect when Plotly adds the modebar
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    const modebar = container.querySelector('.modebar');
                    if (modebar) {
                        // Make sure the modebar is visible and positioned correctly
                        modebar.style.opacity = '1';
                        modebar.style.transform = 'none';
                        
                        // Add event listeners to buttons
                        const buttons = modebar.querySelectorAll('a.modebar-btn');
                        buttons.forEach(button => {
                            button.addEventListener('click', function(e) {
                                // Ensure the button action completes
                                setTimeout(() => {
                                    // If this is a download button, ensure the download happens
                                    if (button.getAttribute('data-title') === 'Download plot as a png') {
                                        console.log('Download button clicked');
                                    }
                                }, 100);
                            });
                        });
                    }
                }
            });
        });
        
        // Start observing
        observer.observe(container, { childList: true, subtree: true });
    });
}

// Add animation to chart containers
function animateCharts() {
    const chartContainers = document.querySelectorAll('.chart-container');
    
    chartContainers.forEach((container, index) => {
        // Add fade-in animation with staggered delay
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        container.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // Staggered animation delay
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100 + (index * 150)); // Stagger the animations
    });
    
    // Also animate stat cards
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
}

// Add Print functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add print button to dashboard actions if not already present
    const dashboardActions = document.querySelector('.dashboard-actions');
    
    if (dashboardActions && !document.getElementById('printButton')) {
        const printButton = document.createElement('button');
        printButton.id = 'printButton';
        printButton.className = 'btn btn-outline-primary';
        printButton.innerHTML = '<i class="bi bi-printer me-2"></i> Print Dashboard';
        printButton.addEventListener('click', printDashboard);
        
        dashboardActions.appendChild(printButton);
    }
});

// Print Dashboard Function
function printDashboard() {
    // Optimize for printing
    window.print();
}

// Add search functionality for resources
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the resources page by looking for a resource table
    const resourceTable = document.getElementById('resourceTable');
    
    if (resourceTable) {
        // Add search input if not already present
        if (!document.getElementById('resourceSearch')) {
            const tableContainer = resourceTable.closest('.table-responsive');
            const searchDiv = document.createElement('div');
            searchDiv.className = 'mb-3';
            searchDiv.innerHTML = `
                <div class="input-group">
                    <span class="input-group-text bg-white">
                        <i class="bi bi-search"></i>
                    </span>
                    <input type="text" id="resourceSearch" class="form-control" placeholder="Search resources...">
                </div>
            `;
            
            if (tableContainer) {
                tableContainer.parentNode.insertBefore(searchDiv, tableContainer);
                
                // Add search functionality
                document.getElementById('resourceSearch').addEventListener('keyup', function() {
                    const searchValue = this.value.toLowerCase();
                    const rows = resourceTable.querySelectorAll('tbody tr');
                    
                    rows.forEach(row => {
                        const text = row.textContent.toLowerCase();
                        if (text.includes(searchValue)) {
                            row.style.display = '';
                        } else {
                            row.style.display = 'none';
                        }
                    });
                });
            }
        }
    }
});

// Add dark mode toggle 
document.addEventListener('DOMContentLoaded', function() {
    const dashboardHeader = document.querySelector('.dashboard-header');
    
    if (dashboardHeader && !document.getElementById('darkModeToggle')) {
        const darkModeBtn = document.createElement('button');
        darkModeBtn.id = 'darkModeToggle';
        darkModeBtn.className = 'btn btn-outline-primary ms-2';
        darkModeBtn.innerHTML = '<i class="bi bi-moon"></i>';
        darkModeBtn.setAttribute('title', 'Toggle Dark Mode');
        
        dashboardHeader.querySelector('.dashboard-actions').appendChild(darkModeBtn);
        
        // Initialize dark mode state from localStorage
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            updateDarkModeButton(true);
        }
        
        // Add event listener
        darkModeBtn.addEventListener('click', toggleDarkMode);
    }
});

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeButton(isDarkMode);
    
    // Redraw charts with appropriate colors
    if (typeof Plotly !== 'undefined') {
        // Re-render charts with dark mode colors
        updateChartsForDarkMode(isDarkMode);
    }
}

function updateDarkModeButton(isDarkMode) {
    const button = document.getElementById('darkModeToggle');
    if (button) {
        button.innerHTML = isDarkMode ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon"></i>';
        button.setAttribute('title', isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
}

function updateChartsForDarkMode(isDarkMode) {
    // Update chart colors for dark mode
    const chartIds = [
        'resource_allocation_chart',
        'utilization_gauge',
        'billing_status_chart',
        'milestone_status_chart',
        'zoho_comparison_chart'
    ];
    
    chartIds.forEach(id => {
        const chartDiv = document.getElementById(id);
        if (chartDiv && chartDiv.data) {
            const updatedLayout = Object.assign({}, chartDiv.layout, {
                paper_bgcolor: isDarkMode ? '#1e1e1e' : 'rgba(0,0,0,0)',
                plot_bgcolor: isDarkMode ? '#1e1e1e' : 'rgba(0,0,0,0)',
                font: {
                    color: isDarkMode ? '#e0e0e0' : '#333333'
                }
            });
            
            Plotly.relayout(id, updatedLayout);
        }
    });
}

// Add a live data refresh simulation
document.addEventListener('DOMContentLoaded', function() {
    const dashboardActions = document.querySelector('.dashboard-actions');
    
    if (dashboardActions && !document.getElementById('refreshButton')) {
        const refreshButton = document.createElement('button');
        refreshButton.id = 'refreshButton';
        refreshButton.className = 'btn btn-outline-primary';
        refreshButton.innerHTML = '<i class="bi bi-arrow-clockwise me-2"></i> Refresh Data';
        
        dashboardActions.appendChild(refreshButton);
        
        // Add click event
        refreshButton.addEventListener('click', function() {
            simulateDataRefresh();
        });
    }
});

function simulateDataRefresh() {
    // Show loading spinner
    const refreshBtn = document.getElementById('refreshButton');
    const originalContent = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Refreshing...';
    refreshBtn.disabled = true;
    
    // Simulate server request delay
    setTimeout(() => {
        // Restore button state
        refreshBtn.innerHTML = originalContent;
        refreshBtn.disabled = false;
        
        // Show success message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.innerHTML = `
            <i class="bi bi-check-circle me-2"></i> 
            Data refreshed successfully at ${new Date().toLocaleTimeString()}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insert at the top of the dashboard container
        const dashboardContainer = document.querySelector('.dashboard-container');
        dashboardContainer.insertBefore(alertDiv, dashboardContainer.firstChild);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 5000);
    }, 1500);
}
