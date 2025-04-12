document.addEventListener('DOMContentLoaded', function() {
    // Create the charts as soon as the DOM is ready
    createCharts();
    
    // Add resize handler for responsive charts
    window.addEventListener('resize', function() {
        Plotly.Plots.resize('allocation_pie_chart');
        Plotly.Plots.resize('utilization_bar_chart');
    });
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
        autosize: true
    };
    
    Plotly.newPlot('allocation_pie_chart', [pieData], pieLayout, { responsive: true });
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
        margin: { t: 10, b: 80, l: 60, r: 10 },
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
        autosize: true
    };
    
    Plotly.newPlot('utilization_bar_chart', barData, barLayout, { responsive: true });
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