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
        Plotly.Plots.resize(document.getElementById('dept_billing_chart'));
        Plotly.Plots.resize(document.getElementById('dept_util_chart'));
    });
});

function renderCharts() {
    // Resource Allocation Chart
    if (chartData.resource_allocation_chart) {
        Plotly.newPlot(
            'resource_allocation_chart', 
            chartData.resource_allocation_chart.data, 
            chartData.resource_allocation_chart.layout,
            {responsive: true}
        );
    }
    
    // Utilization Gauge
    if (chartData.utilization_gauge) {
        Plotly.newPlot(
            'utilization_gauge', 
            chartData.utilization_gauge.data, 
            chartData.utilization_gauge.layout,
            {responsive: true}
        );
    }
    
    // Billing Status Chart
    if (chartData.billing_status_chart) {
        Plotly.newPlot(
            'billing_status_chart', 
            chartData.billing_status_chart.data, 
            chartData.billing_status_chart.layout,
            {responsive: true}
        );
    }
    
    // Milestone Status Chart
    if (chartData.milestone_status_chart) {
        Plotly.newPlot(
            'milestone_status_chart', 
            chartData.milestone_status_chart.data, 
            chartData.milestone_status_chart.layout,
            {responsive: true}
        );
    }
    
    // Department Billing Chart
    if (chartData.dept_billing_chart) {
        Plotly.newPlot(
            'dept_billing_chart', 
            chartData.dept_billing_chart.data, 
            chartData.dept_billing_chart.layout,
            {responsive: true}
        );
    }
    
    // Department Utilization Chart
    if (chartData.dept_util_chart) {
        Plotly.newPlot(
            'dept_util_chart', 
            chartData.dept_util_chart.data, 
            chartData.dept_util_chart.layout,
            {responsive: true}
        );
    }
}