// Enhanced Chart Styling for Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Get current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    // Common Plotly layout settings based on theme
    const getPlotlyTheme = () => {
        const isDark = currentTheme === 'dark';
        return {
            font: {
                family: 'Poppins, sans-serif',
                color: isDark ? '#f0f0f0' : '#333333',
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: {
                l: 50,
                r: 30,
                t: 30,
                b: 50,
                pad: 10
            }
        };
    };

    // Function to enhance charts on the dashboard
    function enhanceCharts() {
        // Define chart colors based on theme
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--chart-red').trim() || '#8b1d1d';
        const successColor = getComputedStyle(document.documentElement).getPropertyValue('--chart-green').trim() || '#28a745';
        const infoColor = getComputedStyle(document.documentElement).getPropertyValue('--chart-blue').trim() || '#17a2b8';
        const warningColor = getComputedStyle(document.documentElement).getPropertyValue('--chart-yellow').trim() || '#f6c23e';
        
        // Get the theme-based layout
        const baseLayout = getPlotlyTheme();
        
        // Update charts based on their IDs
        
        // Resource Allocation Chart
        if (chartData.resource_allocation_chart && document.getElementById('resource_allocation_chart')) {
            const data = chartData.resource_allocation_chart.data.map(trace => {
                // Enhance bar chart
                if (trace.type === 'bar') {
                    return {
                        ...trace,
                        marker: {
                            ...trace.marker,
                            color: trace.name.includes('Allocated') ? primaryColor : 
                                   trace.name.includes('Utilized') ? successColor : 
                                   trace.name.includes('Remaining') ? warningColor : trace.marker.color
                        }
                    };
                }
                return trace;
            });
            
            const layout = {
                ...baseLayout,
                ...chartData.resource_allocation_chart.layout,
                barmode: 'group',
                bargap: 0.2,
                bargroupgap: 0.1,
                legend: {
                    orientation: 'h',
                    y: 1.1
                },
                yaxis: {
                    title: 'Days',
                    gridcolor: currentTheme === 'dark' ? '#333333' : '#e9ecef'
                },
                xaxis: {
                    gridcolor: currentTheme === 'dark' ? '#333333' : '#e9ecef'
                }
            };
            
            Plotly.newPlot('resource_allocation_chart', data, layout, {responsive: true, displayModeBar: false});
        }
        
        // Utilization Gauge
        if (chartData.utilization_gauge && document.getElementById('utilization_gauge')) {
            const data = [{
                type: 'indicator',
                mode: 'gauge+number',
                value: chartData.utilization_gauge.data[0].value,
                title: { text: 'Resource Utilization Rate (%)', font: { size: 18, color: baseLayout.font.color } },
                gauge: {
                    axis: { range: [null, 100], tickwidth: 1, tickcolor: baseLayout.font.color },
                    bar: { color: successColor },
                    bgcolor: 'rgba(0,0,0,0)',
                    borderwidth: 0,
                    steps: [
                        { range: [0, 30], color: currentTheme === 'dark' ? 'rgba(231, 76, 60, 0.3)' : 'rgba(231, 76, 60, 0.1)' },
                        { range: [30, 70], color: currentTheme === 'dark' ? 'rgba(255, 213, 79, 0.3)' : 'rgba(255, 213, 79, 0.1)' },
                        { range: [70, 100], color: currentTheme === 'dark' ? 'rgba(46, 204, 113, 0.3)' : 'rgba(46, 204, 113, 0.1)' }
                    ],
                    threshold: {
                        line: { color: primaryColor, width: 4 },
                        thickness: 0.75,
                        value: chartData.utilization_gauge.data[0].value
                    }
                }
            }];
            
            const layout = {
                ...baseLayout,
                ...chartData.utilization_gauge.layout,
                height: 300
            };
            
            Plotly.newPlot('utilization_gauge', data, layout, {responsive: true, displayModeBar: false});
        }
        
        // Billing Status Chart
        if (chartData.billing_status_chart && document.getElementById('billing_status_chart')) {
            const data = [{
                type: 'pie',
                labels: chartData.billing_status_chart.data[0].labels,
                values: chartData.billing_status_chart.data[0].values,
                hole: 0.5,
                marker: {
                    colors: [successColor, warningColor, primaryColor],
                    line: {
                        color: currentTheme === 'dark' ? '#1e1e1e' : '#ffffff',
                        width: 2
                    }
                },
                textinfo: 'label+percent',
                insidetextorientation: 'radial',
                textfont: {
                    color: baseLayout.font.color
                }
            }];
            
            const layout = {
                ...baseLayout,
                ...chartData.billing_status_chart.layout,
                annotations: [{
                    font: {
                        size: 16,
                        color: baseLayout.font.color
                    },
                    showarrow: false,
                    text: 'Billing<br>Status',
                    x: 0.5,
                    y: 0.5
                }]
            };
            
            Plotly.newPlot('billing_status_chart', data, layout, {responsive: true, displayModeBar: false});
        }
        
        // Milestone Status Chart
        if (chartData.milestone_status_chart && document.getElementById('milestone_status_chart')) {
            const data = chartData.milestone_status_chart.data.map(trace => {
                // Enhance bar chart 
                if (trace.type === 'bar') {
                    return {
                        ...trace,
                        marker: {
                            ...trace.marker,
                            color: primaryColor
                        },
                        texttemplate: '%{y}',
                        textposition: 'outside'
                    };
                }
                return trace;
            });
            
            const layout = {
                ...baseLayout,
                ...chartData.milestone_status_chart.layout,
                yaxis: {
                    title: 'Count',
                    gridcolor: currentTheme === 'dark' ? '#333333' : '#e9ecef'
                },
                xaxis: {
                    title: 'Status',
                    gridcolor: currentTheme === 'dark' ? '#333333' : '#e9ecef'
                }
            };
            
            Plotly.newPlot('milestone_status_chart', data, layout, {responsive: true, displayModeBar: false});
        }
        
        // Zoho Comparison Chart
        if (chartData.zoho_comparison_chart && document.getElementById('zoho_comparison_chart')) {
            const data = chartData.zoho_comparison_chart.data.map(trace => {
                return {
                    ...trace,
                    marker: {
                        ...trace.marker,
                        color: trace.name === 'Project Plan' ? primaryColor : infoColor
                    },
                    texttemplate: '%{x}',
                    textposition: 'outside'
                };
            });
            
            const layout = {
                ...baseLayout,
                ...chartData.zoho_comparison_chart.layout,
                barmode: 'group',
                bargap: 0.2,
                bargroupgap: 0.1,
                legend: {
                    orientation: 'h',
                    y: 1.1
                },
                yaxis: {
                    title: 'Days',
                    gridcolor: currentTheme === 'dark' ? '#333333' : '#e9ecef'
                },
                xaxis: {
                    gridcolor: currentTheme === 'dark' ? '#333333' : '#e9ecef'
                }
            };
            
            Plotly.newPlot('zoho_comparison_chart', data, layout, {responsive: true, displayModeBar: false});
        }
    }
    
    // Initialize enhanced charts
    enhanceCharts();
    
    // Update charts when theme changes
    document.getElementById('theme-toggle').addEventListener('change', function() {
        // Allow time for the theme to update
        setTimeout(enhanceCharts, 100);
    });
    
    // Make charts responsive
    window.addEventListener('resize', function() {
        Plotly.Plots.resize('resource_allocation_chart');
        Plotly.Plots.resize('utilization_gauge');
        Plotly.Plots.resize('billing_status_chart');
        Plotly.Plots.resize('milestone_status_chart');
        Plotly.Plots.resize('zoho_comparison_chart');
    });
});