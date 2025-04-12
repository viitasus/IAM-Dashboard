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
        
        # 2. Department Billing Bar Chart
        charts['dept_billing_chart'] = create_dept_billing_chart(data)
        
        # 3. Department Utilization Rate
        charts['dept_util_chart'] = create_dept_util_chart(data)
        
        # 4. Milestone Status Distribution
        charts['milestone_status_chart'] = create_milestone_status_chart(data)
        
        # 5. Overall Resource Allocation
        charts['resource_allocation_chart'] = create_resource_allocation_chart(data)
        
        # 6. Utilization Gauge
        charts['utilization_gauge'] = create_utilization_gauge(data)
        
        # 7. Milestone Completion by Project Type (if available)
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
        margin=dict(t=50, b=50, l=10, r=10)
    )
    
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)


def create_dept_billing_chart(data):
    """Create bar chart of allocated billing days by department"""
    if 'dept_billing' not in data or not data['dept_billing']:
        return None
    
    # Sort departments by allocated days (descending)
    sorted_depts = sorted(data['dept_billing'].items(), key=lambda x: x[1], reverse=True)
    dept_names = [x[0] for x in sorted_depts]
    dept_values = [x[1] for x in sorted_depts]
    
    fig = px.bar(
        x=dept_names,
        y=dept_values,
        title='Allocated Billing Days by Department',
        labels={'x': 'Department', 'y': 'Allocated Days'},
        color_discrete_sequence=['#00C49F'],
        text=dept_values
    )
    
    fig.update_traces(texttemplate='%{text:.1f}', textposition='outside')
    fig.update_layout(
        xaxis_tickangle=-45,
        margin=dict(t=50, b=80, l=10, r=10)
    )
    
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)


def create_dept_util_chart(data):
    """Create bar chart of utilization rate by department"""
    if 'dept_util_rate' not in data or not data['dept_util_rate']:
        return None
    
    # Sort departments by utilization rate (descending)
    sorted_depts = sorted(data['dept_util_rate'].items(), key=lambda x: x[1], reverse=True)
    dept_names = [x[0] for x in sorted_depts]
    dept_values = [x[1] for x in sorted_depts]
    
    # Define color gradient based on utilization rate
    colors = []
    for rate in dept_values:
        if rate < 30:
            colors.append('#FF8042')  # Orange/red for low utilization
        elif rate < 70:
            colors.append('#FFBB28')  # Yellow for medium utilization
        else:
            colors.append('#00C49F')  # Green for high utilization
    
    fig = px.bar(
        x=dept_names,
        y=dept_values,
        title='Resource Utilization Rate by Department (%)',
        labels={'x': 'Department', 'y': 'Utilization Rate (%)'},
        text=[f"{v:.1f}%" for v in dept_values]
    )
    
    fig.update_traces(marker_color=colors, textposition='outside')
    fig.update_layout(
        yaxis_range=[0, 100],
        xaxis_tickangle=-45,
        margin=dict(t=50, b=80, l=10, r=10)
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
    
    fig = px.bar(
        x=status_names,
        y=status_counts,
        title='Milestone Status Distribution',
        labels={'x': 'Status', 'y': 'Count'},
        text=status_counts
    )
    
    fig.update_traces(marker_color=colors, textposition='outside')
    fig.update_layout(
        xaxis_tickangle=-45,
        margin=dict(t=50, b=80, l=10, r=10)
    )
    
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)


def create_resource_allocation_chart(data):
    """Create bar chart comparing allocated, utilized and remaining days"""
    # Check if we have the necessary data
    if not all(k in data for k in ['total_allocated', 'total_utilized', 'total_remaining']):
        return None
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=['Allocated', 'Utilized', 'Remaining'],
        y=[data.get('total_allocated', 0), data.get('total_utilized', 0), data.get('total_remaining', 0)],
        marker_color=['#0088FE', '#00C49F', '#FFBB28'],
        text=[f"{data.get('total_allocated', 0):.1f}", 
              f"{data.get('total_utilized', 0):.1f}", 
              f"{data.get('total_remaining', 0):.1f}"]
    ))
    
    fig.update_traces(textposition='outside')
    fig.update_layout(
        title_text='Overall Resource Allocation (Billed Days)',
        margin=dict(t=50, b=30, l=10, r=10),
        yaxis_title="Days"
    )
    
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)


def create_utilization_gauge(data):
    """Create gauge chart for resource utilization rate"""
    utilization_rate = data.get('utilization_rate', 0)
    
    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=utilization_rate,
        domain={'x': [0, 1], 'y': [0, 1]},
        title={'text': "Resource Utilization Rate (%)"},
        gauge={
            'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': "darkblue"},
            'bar': {'color': "#00C49F" if utilization_rate >= 70 else 
                   "#FFBB28" if utilization_rate >= 30 else "#FF8042"},
            'steps': [
                {'range': [0, 30], 'color': "rgba(255, 128, 66, 0.3)"},  # Light orange
                {'range': [30, 70], 'color': "rgba(255, 187, 40, 0.3)"},  # Light yellow
                {'range': [70, 100], 'color': "rgba(0, 196, 159, 0.3)"}   # Light green
            ],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': 90
            }
        }
    ))
    
    fig.update_layout(
        margin=dict(t=50, b=30, l=30, r=30)
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
    
    # Add traces for each status type
    for status in status_types:
        y_values = [chart_data.get(proj, {}).get(status, 0) for proj in project_types]
        fig.add_trace(go.Bar(
            name=status,
            x=project_types,
            y=y_values,
            text=y_values,
            textposition='auto'
        ))
    
    # Customize layout
    fig.update_layout(
        barmode='stack',
        title='Milestone Status by Project Type',
        xaxis_title='Project Type',
        yaxis_title='Number of Milestones',
        legend_title='Milestone Status',
        xaxis_tickangle=-45,
        margin=dict(t=50, b=80, l=10, r=10)
    )
    
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)