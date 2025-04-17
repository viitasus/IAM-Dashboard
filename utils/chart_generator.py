"""
Chart generator module for Resource Billing Dashboard
Creates Plotly visualizations based on processed data
"""
import plotly
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json


def create_charts(data):
    """Create all charts for the dashboard based on processed data"""
    charts = {}
    
    # Only create charts if we have data and no errors
    if not data.get('error'):
        # 1. Billing Status Pie Chart
        charts['billing_status_chart'] = create_billing_status_chart(data)
        
        # 2. Milestone Status Distribution
        charts['milestone_status_chart'] = create_milestone_status_chart(data)
        
        # 3. Overall Resource Allocation
        charts['resource_allocation_chart'] = create_resource_allocation_chart(data)
        
        # 4. Utilization Gauge
        charts['utilization_gauge'] = create_utilization_gauge(data)
        
        # 5. Zoho Comparison Chart
        charts['zoho_comparison_chart'] = create_zoho_comparison_chart(data)
        
        # 6. Milestone Completion by Project Type (if available)
        if data.get('milestone_by_type'):
            charts['milestone_by_type_chart'] = create_milestone_by_type_chart(data)
    
    return charts


def create_billing_status_chart(data):
    """Create pie chart of billing status distribution"""
    if 'status_counts' not in data or not data['status_counts']:
        return None
    
    fig = px.pie(
        values=list(data['status_counts'].values()),
        names=list(data['status_counts'].keys()),
        title='Billing Status Distribution',
        color_discrete_sequence=px.colors.qualitative.Set3,
        hole=0.3
    )
    
    fig.update_layout(
        legend=dict(orientation="h", yanchor="bottom", y=-0.2, xanchor="center", x=0.5),
        margin=dict(t=70, b=80, l=40, r=40),
        height=450,  # Increased height
        title={
            'text': "<b>Billing Status Distribution</b>",
            'y': 0.95,
            'x': 0.5,
            'xanchor': 'center',
            'yanchor': 'top',
            'font': {'size': 18}
        },
        plot_bgcolor='rgb(248,249,250)',
        paper_bgcolor='rgb(248,249,250)'
    )
    
    # Improve hover info
    fig.update_traces(
        textinfo='percent+label',
        hoverinfo='label+value+percent',
        textfont_size=14,
        marker=dict(line=dict(color='#fff', width=2))
    )
    
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)


def create_milestone_status_chart(data):
    """Create bar chart of milestone status distribution"""
    if 'milestone_counts' not in data or not data['milestone_counts']:
        return None
    
    # Sort statuses by count (descending)
    sorted_statuses = sorted(data['milestone_counts'].items(), key=lambda x: x[1], reverse=True)
    status_names = [x[0] for x in sorted_statuses]
    status_counts = [x[1] for x in sorted_statuses]
    
    # Define colors based on status
    colors = []
    for status in status_names:
        status_lower = status.lower()
        if 'complete' in status_lower:
            colors.append('#00C49F')  # Green for completed
        elif 'track' in status_lower:
            colors.append('#0088FE')  # Blue for on track
        elif 'hold' in status_lower:
            colors.append('#FFBB28')  # Yellow for on hold
        elif 'delay' in status_lower or 'block' in status_lower:
            colors.append('#FF8042')  # Orange for delayed/blocked
        elif 'not' in status_lower and 'start' in status_lower:
            colors.append('#8884d8')  # Purple for not started
        else:
            colors.append('#ccc')     # Grey for other statuses
    
    fig = go.Figure()
    
    fig.add_trace(go.Bar(
        x=status_names,
        y=status_counts,
        text=status_counts,
        textposition='outside',
        marker_color=colors,
        hovertemplate='Status: %{x}<br>Count: %{y}<extra></extra>'
    ))
    
    fig.update_layout(
        title={
            'text': "<b>Milestone Status Distribution</b>",
            'y': 0.95,
            'x': 0.5,
            'xanchor': 'center',
            'yanchor': 'top',
            'font': {'size': 18}
        },
        xaxis_title="Status",
        yaxis_title="Count",
        xaxis_tickangle=-45,
        margin=dict(t=70, b=100, l=80, r=40),
        height=450,  # Increased height
        plot_bgcolor='rgb(248,249,250)',
        paper_bgcolor='rgb(248,249,250)',
        xaxis=dict(
            title_font=dict(size=14),
            tickfont=dict(size=12)
        ),
        yaxis=dict(
            title_font=dict(size=14),
            tickfont=dict(size=12)
        )
    )
    
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)


def create_resource_allocation_chart(data):
    """Create bar chart comparing allocated, utilized and remaining days"""
    # Check if we have the necessary data
    if not all(k in data for k in ['total_allocated', 'total_utilized', 'total_remaining']):
        return None
    
    fig = go.Figure()
    
    # Get values for better annotation positioning
    allocated = data.get('total_allocated', 0)
    utilized = data.get('total_utilized', 0)
    remaining = data.get('total_remaining', 0)
    
    # Define colors with better contrast
    bar_colors = ['#8b1d1d', '#28a745', '#f6c23e']  # RNS primary, success, warning
    
    # Add bars with improved styling
    fig.add_trace(go.Bar(
        x=['Allocated', 'Utilized', 'Remaining'],
        y=[allocated, utilized, remaining],
        marker_color=bar_colors,
        text=[f"{allocated:.1f}", f"{utilized:.1f}", f"{remaining:.1f}"],
        textposition='outside',
        hovertemplate='%{x}: %{y:.1f} days<extra></extra>',
        width=[0.6, 0.6, 0.6]  # Slightly thinner bars
    ))
    
    fig.update_layout(
        # Remove the title from the layout
        margin=dict(t=20, b=60, l=80, r=40),  # Reduced top margin since no title
        height=450,
        yaxis_title="Days",
        plot_bgcolor='rgb(248,249,250)',
        paper_bgcolor='rgb(248,249,250)',
        xaxis=dict(
            title_font=dict(size=14),
            tickfont=dict(size=14),
            tickangle=0
        ),
        yaxis=dict(
            title_font=dict(size=14),
            tickfont=dict(size=12),
            gridcolor='rgba(0,0,0,0.1)'
        )
    )
    
    # Add annotations with improved positioning
    annotations = [
        dict(
            x="Allocated", 
            y=allocated / 2,  # Position in the middle of the bar
            text="Total days allocated<br>for all resources",
            showarrow=False,
            font=dict(size=12, color="white")
        ),
        dict(
            x="Utilized", 
            y=utilized / 2,  # Position in the middle of the bar
            text="Days utilized according<br>to project plan",
            showarrow=False,
            font=dict(size=12, color="white")
        ),
        dict(
            x="Remaining", 
            y=remaining / 2,  # Position in the middle of the bar
            text="Days remaining<br>to be utilized",
            showarrow=False,
            font=dict(size=12, color="white")
        )
    ]
    
    fig.update_layout(annotations=annotations)
    
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

def create_utilization_gauge(data):
    """Create gauge chart for resource utilization rate"""
    utilization_rate = data.get('utilization_rate', 0)
    
    # Make steps for the gauge more visually distinct but remove the invalid 'text' property
    steps = [
        {'range': [0, 30], 'color': "rgba(231, 74, 59, 0.3)"},   # Light red
        {'range': [30, 70], 'color': "rgba(246, 194, 62, 0.3)"},  # Light yellow
        {'range': [70, 100], 'color': "rgba(28, 200, 138, 0.3)"}  # Light green
    ]
    
    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=utilization_rate,
        domain={'x': [0, 1], 'y': [0, 1]},
        delta={'reference': 70, 'increasing': {'color': "green"}, 'decreasing': {'color': "red"}},
        title={
            'text': "Resource Utilization Rate (%)", 
            'font': {'size': 16}
        },
        gauge={
            'axis': {
                'range': [0, 100], 
                'tickwidth': 1, 
                'tickcolor': "darkblue",
                'tickvals': [0, 30, 70, 100],
                'ticktext': ['0%', '30%', '70%', '100%']
            },
            'bar': {'color': "#00C49F" if utilization_rate >= 70 else 
                   "#FFBB28" if utilization_rate >= 30 else "#FF8042"},
            'steps': steps,
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': 90
            }
        }
    ))
    
    # Add annotations explaining the gauge ranges
    annotations = [
        dict(
            x=0.15, 
            y=0.15,
            text="Under-utilized",
            showarrow=False,
            font=dict(size=10, color="#e74a3b")
        ),
        dict(
            x=0.5, 
            y=0.15,
            text="Moderate",
            showarrow=False,
            font=dict(size=10, color="#f6c23e")
        ),
        dict(
            x=0.85, 
            y=0.15,
            text="Optimal",
            showarrow=False,
            font=dict(size=10, color="#1cc88a")
        )
    ]
    
    fig.update_layout(
        # Remove the title from the layout
        margin=dict(t=30, b=50, l=40, r=40),  # Reduced top margin
        height=450,
        plot_bgcolor='rgb(248,249,250)',
        paper_bgcolor='rgb(248,249,250)',
        annotations=annotations
    )
    
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

def create_milestone_by_type_chart(data):
    """Create stacked bar chart for milestone status by project type"""
    milestone_data = data.get('milestone_by_type')
    if not milestone_data:
        return None
    
    project_types = milestone_data.get('project_types', [])
    status_types = milestone_data.get('status_types', [])
    chart_data = milestone_data.get('data', {})
    
    if not project_types or not status_types or not chart_data:
        return None
    
    # Create figure
    fig = go.Figure()
    
    # Define a better color palette
    color_map = {
        'Completed': '#1cc88a',  # Green
        'Not Started': '#858796',  # Gray
        'On Hold': '#f6c23e',  # Yellow
        'Delayed': '#e74a3b',  # Red
        'On Track': '#4e73df',  # Blue
        'In Progress': '#36b9cc'  # Cyan
    }
    
    # Use default colors for any status not in the map
    default_colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f']
    
    # Add traces for each status type with custom colors
    for i, status in enumerate(status_types):
        y_values = [chart_data.get(proj, {}).get(status, 0) for proj in project_types]
        
        fig.add_trace(go.Bar(
            name=status,
            x=project_types,
            y=y_values,
            text=y_values,
            textposition='inside',
            marker_color=color_map.get(status, default_colors[i % len(default_colors)]),
            hovertemplate='Project Type: %{x}<br>Status: ' + status + '<br>Count: %{y}<extra></extra>'
        ))
    
    # Customize layout
    fig.update_layout(
        barmode='stack',
        title={
            'text': "<b>Milestone Status by Project Type</b>",
            'y': 0.95,
            'x': 0.5,
            'xanchor': 'center',
            'yanchor': 'top',
            'font': {'size': 18}
        },
        xaxis_title="Project Type",
        yaxis_title="Number of Milestones",
        legend_title="Milestone Status",
        xaxis_tickangle=-45,
        margin=dict(t=70, b=100, l=60, r=40),
        height=500,  # Increased height
        plot_bgcolor='rgb(248,249,250)',
        paper_bgcolor='rgb(248,249,250)',
        legend=dict(
            font=dict(size=12)
        ),
        xaxis=dict(
            title_font=dict(size=14),
            tickfont=dict(size=12)
        ),
        yaxis=dict(
            title_font=dict(size=14),
            tickfont=dict(size=12),
            gridcolor='rgba(0,0,0,0.1)'
        )
    )
    
    # Add annotation explaining stacked bars
    fig.add_annotation(
        x=0.5,
        y=-0.2,
        xref="paper",
        yref="paper",
        text="Each bar shows the distribution of milestone statuses for a project type.<br>Hover over segments for details.",
        showarrow=False,
        font=dict(size=12),
        align="center"
    )
    
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

def create_zoho_comparison_chart(data):
    """Create comparison chart between Project Plan and Zoho utilization"""
    # Check if we have both project plan and Zoho utilization data
    if 'total_utilized' not in data or 'total_zoho_utilized' not in data:
        return None
    
    # Create figure with subplots - one for overall, one for departments
    if 'dept_comparison' in data and data['dept_comparison']:
        # Get unique department names
        dept_data = data['dept_comparison']
        # Sort departments by project plan utilization
        dept_data.sort(key=lambda x: x['project_plan'], reverse=True)
        
        # Create a horizontal bar chart for better readability
        fig = go.Figure()
        
        # Add department data
        dept_names = [dept['department'] for dept in dept_data]
        
        # Add Project Plan bars
        fig.add_trace(go.Bar(
            y=dept_names,
            x=[dept['project_plan'] for dept in dept_data],
            name='Project Plan',
            marker_color='#4e73df',  # Strong blue
            text=[f"{dept['project_plan']:.1f}" for dept in dept_data],
            textposition='auto',
            orientation='h',
            hovertemplate='Department: %{y}<br>Project Plan: %{x:.1f} days<extra></extra>'
        ))
        
        # Add Zoho bars
        fig.add_trace(go.Bar(
            y=dept_names,
            x=[dept['zoho'] for dept in dept_data],
            name='Zoho',
            marker_color='#1cc88a',  # Strong green
            text=[f"{dept['zoho']:.1f}" for dept in dept_data],
            textposition='auto',
            orientation='h',
            hovertemplate='Department: %{y}<br>Zoho: %{x:.1f} days<extra></extra>'
        ))
        
        # Add an "Overall" category at the top
        fig.add_trace(go.Bar(
            y=['Overall'],
            x=[data.get('total_utilized', 0)],
            name='Project Plan',
            marker_color='#4e73df',
            text=[f"{data.get('total_utilized', 0):.1f}"],
            textposition='auto',
            orientation='h',
            showlegend=False,
            hovertemplate='Overall Project Plan: %{x:.1f} days<extra></extra>'
        ))
        
        fig.add_trace(go.Bar(
            y=['Overall'],
            x=[data.get('total_zoho_utilized', 0)],
            name='Zoho',
            marker_color='#1cc88a',
            text=[f"{data.get('total_zoho_utilized', 0):.1f}"],
            textposition='auto',
            orientation='h',
            showlegend=False,
            hovertemplate='Overall Zoho: %{x:.1f} days<extra></extra>'
        ))
        
        # Update layout for a horizontal bar chart - remove title
        fig.update_layout(
            xaxis_title="Days",
            barmode='group',
            margin=dict(t=20, b=50, l=180, r=40),  # Reduced top margin
            height=500,  # Taller chart to accommodate all departments
            plot_bgcolor='rgb(248,249,250)',
            paper_bgcolor='rgb(248,249,250)',
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="center",
                x=0.5,
                font=dict(size=14)
            ),
            xaxis=dict(
                title_font=dict(size=14),
                tickfont=dict(size=12),
                gridcolor='rgba(0,0,0,0.1)'
            ),
            yaxis=dict(
                tickfont=dict(size=14)
            )
        )
        
        # Add a separator line between Overall and departments
        fig.add_shape(
            type="line",
            x0=0,
            y0=0.5,
            x1=max(data.get('total_utilized', 0), data.get('total_zoho_utilized', 0)) * 1.1,
            y1=0.5,
            line=dict(
                color="rgba(0,0,0,0.3)",
                width=1,
                dash="dash",
            )
        )
        
        # Add annotations explaining the comparison
        fig.add_annotation(
            x=max(data.get('total_utilized', 0), data.get('total_zoho_utilized', 0)) * 0.5,
            y=-0.5,
            text="<b>Project Plan</b>: Days utilized according to internal project planning<br><b>Zoho</b>: Days utilized according to Zoho time tracking",
            showarrow=False,
            font=dict(size=12),
            align="center",
            xanchor="center",
            yanchor="top"
        )
        
    else:
        # If no department data, create a simpler bar chart
        fig = go.Figure()
        
        # Add bars for overall comparison with better styling
        fig.add_trace(go.Bar(
            x=['Overall Utilization'],
            y=[data.get('total_utilized', 0)],
            name='Project Plan',
            marker_color='#4e73df',
            text=[f"{data.get('total_utilized', 0):.1f}"],
            textposition='outside',
            width=[0.3],
            hovertemplate='Project Plan: %{y:.1f} days<extra></extra>'
        ))
        
        fig.add_trace(go.Bar(
            x=['Overall Utilization'],
            y=[data.get('total_zoho_utilized', 0)],
            name='Zoho',
            marker_color='#1cc88a',
            text=[f"{data.get('total_zoho_utilized', 0):.1f}"],
            textposition='outside',
            width=[0.3],
            hovertemplate='Zoho: %{y:.1f} days<extra></extra>'
        ))
        
        # Update layout - remove title
        fig.update_layout(
            yaxis_title="Days",
            barmode='group',
            margin=dict(t=20, b=100, l=60, r=40),  # Reduced top margin
            height=450,
            plot_bgcolor='rgb(248,249,250)',
            paper_bgcolor='rgb(248,249,250)',
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="center",
                x=0.5,
                font=dict(size=14)
            ),
            yaxis=dict(
                title_font=dict(size=14),
                tickfont=dict(size=12),
                gridcolor='rgba(0,0,0,0.1)'
            ),
            xaxis=dict(
                tickfont=dict(size=14)
            ),
            bargap=0.15
        )
        
        # Add annotation explaining the comparison
        fig.add_annotation(
            x=0,
            y=-50,
            text="<b>Project Plan</b>: Days utilized according to internal project planning<br><b>Zoho</b>: Days utilized according to Zoho time tracking",
            showarrow=False,
            font=dict(size=12),
            align="center",
            xanchor="center",
            yanchor="top"
        )
    
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)