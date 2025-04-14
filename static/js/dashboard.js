document.addEventListener('DOMContentLoaded', function() {
    // Render all charts
    renderCharts();
    
    // Setup responsive behavior
    window.addEventListener('resize', function() {
        // Redraw charts on window resize
        Plotly.Plots.resize(document.getElementById('resource_allocation_chart'));
        Plotly.Plots.resize(document.getElementById('utilization_gauge'));
        Plotly.Plots.resize(document.getElementById('billing_status_chart'));
        Plotly.Plots.resize(document.getElementById('milestone_status_chart'));
        Plotly.Plots.resize(document.getElementById('zoho_comparison_chart'));
    });
    
    // Set up modal for data display
    setupDataModal();
    
    // Setup chart toolbar event handlers for Plotly buttons
    setupChartToolbarHandlers();
});

function renderCharts() {
    // Resource Allocation Chart
    if (chartData.resource_allocation_chart) {
        Plotly.newPlot(
            'resource_allocation_chart', 
            chartData.resource_allocation_chart.data, 
            chartData.resource_allocation_chart.layout,
            {responsive: true, displayModeBar: true, modeBarButtonsToRemove: ['lasso2d']}
        );
        
        // Add click event
        document.getElementById('resource_allocation_chart').on('plotly_click', function(data) {
            showDataTable('Resource Allocation', convertChartToTableData(chartData.resource_allocation_chart, data));
        });
    }
    
    // Utilization Gauge
    if (chartData.utilization_gauge) {
        Plotly.newPlot(
            'utilization_gauge', 
            chartData.utilization_gauge.data, 
            chartData.utilization_gauge.layout,
            {responsive: true, displayModeBar: true, modeBarButtonsToRemove: ['lasso2d']}
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
        Plotly.newPlot(
            'billing_status_chart', 
            chartData.billing_status_chart.data, 
            chartData.billing_status_chart.layout,
            {responsive: true, displayModeBar: true, modeBarButtonsToRemove: ['lasso2d']}
        );
        
        // Add click event
        document.getElementById('billing_status_chart').on('plotly_click', function(data) {
            showDataTable('Billing Status Distribution', convertChartToTableData(chartData.billing_status_chart, data));
        });
    }
    
    // Milestone Status Chart
    if (chartData.milestone_status_chart) {
        Plotly.newPlot(
            'milestone_status_chart', 
            chartData.milestone_status_chart.data, 
            chartData.milestone_status_chart.layout,
            {responsive: true, displayModeBar: true, modeBarButtonsToRemove: ['lasso2d']}
        );
        
        // Add click event
        document.getElementById('milestone_status_chart').on('plotly_click', function(data) {
            showDataTable('Milestone Status Distribution', convertChartToTableData(chartData.milestone_status_chart, data));
        });
    }
    
    // Zoho Comparison Chart
    if (chartData.zoho_comparison_chart) {
        Plotly.newPlot(
            'zoho_comparison_chart', 
            chartData.zoho_comparison_chart.data, 
            chartData.zoho_comparison_chart.layout,
            {responsive: true, displayModeBar: true, modeBarButtonsToRemove: ['lasso2d']}
        );
        
        // Add click event
        document.getElementById('zoho_comparison_chart').on('plotly_click', function(data) {
            showDataTable('Project Plan vs Zoho Comparison', convertChartToTableData(chartData.zoho_comparison_chart, data));
        });
    }
}

// Function to handle chart toolbar button interactions
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

// Function to convert chart data to table format for display
function convertChartToTableData(chartObj, clickData) {
    const tableData = [];
    
    if (!chartObj || !chartObj.data) return tableData;
    
    // Different logic based on chart type
    if (chartObj.data[0].type === 'pie') {
        // For pie charts
        const labels = chartObj.data[0].labels || [];
        const values = chartObj.data[0].values || [];
        
        for (let i = 0; i < labels.length; i++) {
            tableData.push({
                Category: labels[i],
                Value: values[i]
            });
        }
    } else if (chartObj.data[0].type === 'bar') {
        // For bar charts
        const xValues = chartObj.data[0].x || [];
        
        // Create an entry for each x value
        for (let i = 0; i < xValues.length; i++) {
            const entry = {
                Category: xValues[i]
            };
            
            // Add values from each trace
            chartObj.data.forEach(trace => {
                if (trace.y && trace.y[i] !== undefined) {
                    entry[trace.name || 'Value'] = trace.y[i];
                }
            });
            
            tableData.push(entry);
        }
    } else {
        // For other chart types
        chartObj.data.forEach(trace => {
            if (trace.x && trace.y) {
                for (let i = 0; i < trace.x.length; i++) {
                    tableData.push({
                        X: trace.x[i],
                        Y: trace.y[i],
                        Series: trace.name || 'Value'
                    });
                }
            }
        });
    }
    
    // If it's a click event, highlight the clicked data point
    if (clickData && clickData.points && clickData.points.length > 0) {
        const point = clickData.points[0];
        if (point.pointIndex !== undefined && tableData[point.pointIndex]) {
            tableData[point.pointIndex].highlighted = true;
        }
    }
    
    return tableData;
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