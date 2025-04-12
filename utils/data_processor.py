"""
Data processor module for Resource Billing Dashboard
Handles all Excel data processing functions
"""
import pandas as pd
import numpy as np


def process_excel_data(file_path):
    """Process the Excel file to extract relevant data"""
    data = {}
    
    # Read both sheets
    try:
        billed_df = pd.read_excel(file_path, sheet_name='Billed_2025')
        milestone_df = pd.read_excel(file_path, sheet_name='Milestone Status ')
        
        # Process billing data
        data.update(process_billing_data(billed_df))
        
        # Process milestone data
        if not milestone_df.empty and 'Milestone Status' in milestone_df.columns:
            data.update(process_milestone_data(milestone_df))
            
            # Link data between billing and milestone if possible
            data.update(link_billing_milestone_data(billed_df, milestone_df))
        
        # Process resource data (person-level data)
        data.update(process_resource_data(billed_df))
        
        # Process Zoho comparison data
        data.update(process_zoho_data(billed_df))
    
    except Exception as e:
        print(f"Error processing Excel file: {e}")
        data['error'] = str(e)
    
    return data


def process_billing_data(df):
    """Extract metrics from Billed_2025 sheet"""
    result = {}
    
    if df.empty:
        return result
    
    # Standardize column names for robustness
    df.columns = [str(col).strip() for col in df.columns]
    
    # Find the relevant columns (handle slight variations in column names)
    allocated_col = next((col for col in df.columns if 'Allocated' in col and '2025' in col), None)
    utilized_col = next((col for col in df.columns if 'Utilized' in col and '2025' in col and 'Project plan' in col), None)
    remaining_col = next((col for col in df.columns if 'Remaining' in col and '2025' in col and 'Project plan' in col), None)
    status_col = next((col for col in df.columns if 'Status' in col and not ('Milestone' in col)), None)
    dept_col = next((col for col in df.columns if col.lower() in ['department', 'dept']), None)
    
    # Find Zoho columns
    zoho_hrs_col = next((col for col in df.columns if 'Zoho' in col and 'hrs' in col), None)
    zoho_days_col = next((col for col in df.columns if 'Zoho' in col and 'days' in col and '2025' in col), None)
    zoho_remaining_col = next((col for col in df.columns if 'Remaining' in col and 'Zoho' in col and '2025' in col), None)
    
    # Summary metrics
    if allocated_col:
        result['total_allocated'] = df[allocated_col].sum() if pd.api.types.is_numeric_dtype(df[allocated_col]) else 0
    if utilized_col:
        result['total_utilized'] = df[utilized_col].sum() if pd.api.types.is_numeric_dtype(df[utilized_col]) else 0
    if remaining_col:
        result['total_remaining'] = df[remaining_col].sum() if pd.api.types.is_numeric_dtype(df[remaining_col]) else 0
    
    # Zoho metrics
    if zoho_days_col:
        result['total_zoho_utilized'] = df[zoho_days_col].sum() if pd.api.types.is_numeric_dtype(df[zoho_days_col]) else 0
    if zoho_remaining_col:
        result['total_zoho_remaining'] = df[zoho_remaining_col].sum() if pd.api.types.is_numeric_dtype(df[zoho_remaining_col]) else 0
    
    # Calculate utilization rate
    if result.get('total_allocated', 0) > 0:
        result['utilization_rate'] = (result.get('total_utilized', 0) / result['total_allocated']) * 100
        
        # Also calculate Zoho utilization rate if available
        if 'total_zoho_utilized' in result:
            result['zoho_utilization_rate'] = (result['total_zoho_utilized'] / result['total_allocated']) * 100
    else:
        result['utilization_rate'] = 0
        result['zoho_utilization_rate'] = 0 if 'total_zoho_utilized' in result else None
    
    # Billing status distribution
    if status_col:
        result['status_counts'] = df[status_col].value_counts().to_dict()
        
        # Get billing data by status
        if allocated_col and status_col:
            result['billing_by_status'] = df.groupby(status_col)[allocated_col].sum().to_dict()
    
    # Department analysis
    if dept_col and allocated_col:
        result['dept_billing'] = df.groupby(dept_col)[allocated_col].sum().to_dict()
        
        # Department utilization
        if utilized_col:
            dept_utilized = df.groupby(dept_col)[utilized_col].sum().to_dict()
            dept_allocated = df.groupby(dept_col)[allocated_col].sum().to_dict()
            
            dept_util_rate = {}
            for dept in dept_allocated:
                if dept_allocated[dept] > 0:
                    dept_util_rate[dept] = (dept_utilized.get(dept, 0) / dept_allocated[dept]) * 100
                else:
                    dept_util_rate[dept] = 0
            result['dept_util_rate'] = dept_util_rate
    
    return result


def process_milestone_data(df):
    """Extract metrics from Milestone Status sheet"""
    result = {}
    
    if df.empty:
        return result
    
    # Standardize column names
    df.columns = [str(col).strip() for col in df.columns]
    
    # Find the relevant columns
    status_col = next((col for col in df.columns if 'Milestone' in col and 'Status' in col), None)
    project_col = next((col for col in df.columns 
                       if col.lower() in ['project type', 'project_type', 'projecttype']), None)
    
    # Milestone status distribution
    if status_col:
        result['milestone_counts'] = df[status_col].value_counts().to_dict()
        
        # Calculate completion rate
        total_milestones = len(df)
        completed = df[status_col].str.lower().str.contains('complete').sum()
        if total_milestones > 0:
            result['milestone_completion_rate'] = (completed / total_milestones) * 100
        else:
            result['milestone_completion_rate'] = 0
    
    # Milestone by project type
    if status_col and project_col:
        milestone_by_type = pd.crosstab(df[project_col], df[status_col])
        result['milestone_by_type'] = {
            'project_types': milestone_by_type.index.tolist(),
            'status_types': milestone_by_type.columns.tolist(),
            'data': milestone_by_type.to_dict('index')
        }
    
    return result


def process_resource_data(df):
    """Extract person-level data and their project assignments"""
    result = {}
    
    if df.empty:
        return result
    
    # Standardize column names
    df.columns = [str(col).strip() for col in df.columns]
    
    # Find the relevant columns
    resource_col = next((col for col in df.columns 
                        if col.lower() in ['resource', 'resource name', 'person']), None)
    project_col = next((col for col in df.columns 
                       if col.lower() in ['project name', 'project', 'project_name']), None)
    dept_col = next((col for col in df.columns 
                    if col.lower() in ['department', 'dept']), None)
    role_col = next((col for col in df.columns 
                    if col.lower() in ['role', 'position', 'title']), None)
    engagement_col = next((col for col in df.columns 
                          if 'engagement' in col.lower() or 'type' in col.lower()), None)
    allocated_col = next((col for col in df.columns 
                         if 'allocated' in col.lower() and '2025' in col.lower()), None)
    utilized_col = next((col for col in df.columns 
                        if 'utilized' in col.lower() and '2025' in col.lower() and 'project plan' in col.lower()), None)
    
    # Zoho columns
    zoho_hrs_col = next((col for col in df.columns if 'Zoho' in col and 'hrs' in col), None)
    zoho_days_col = next((col for col in df.columns if 'Zoho' in col and 'days' in col and '2025' in col), None)
    
    # If we don't have the essential columns, return empty result
    if not resource_col or not project_col:
        return result
    
    # Extract resource data
    resources = []
    unique_resources = df[resource_col].unique()
    
    for person in unique_resources:
        person_data = {
            'name': person,
            'projects': []
        }
        
        # Get all rows for this person
        person_df = df[df[resource_col] == person]
        
        # Add department if available (assume one department per person)
        if dept_col and not person_df.empty:
            person_data['department'] = person_df[dept_col].iloc[0]
        
        # Add role if available (assume one role per person)
        if role_col and not person_df.empty:
            person_data['role'] = person_df[role_col].iloc[0]
        
        # Calculate total allocation and utilization for this person
        if allocated_col:
            person_data['total_allocated'] = person_df[allocated_col].sum() if pd.api.types.is_numeric_dtype(person_df[allocated_col]) else 0
        if utilized_col:
            person_data['total_utilized'] = person_df[utilized_col].sum() if pd.api.types.is_numeric_dtype(person_df[utilized_col]) else 0
            if person_data.get('total_allocated', 0) > 0:
                person_data['utilization_rate'] = (person_data['total_utilized'] / person_data['total_allocated']) * 100
            else:
                person_data['utilization_rate'] = 0
                
        # Add Zoho utilization if available
        if zoho_days_col:
            person_data['total_zoho_utilized'] = person_df[zoho_days_col].sum() if pd.api.types.is_numeric_dtype(person_df[zoho_days_col]) else 0
            if person_data.get('total_allocated', 0) > 0:
                person_data['zoho_utilization_rate'] = (person_data['total_zoho_utilized'] / person_data['total_allocated']) * 100
            else:
                person_data['zoho_utilization_rate'] = 0
        
        # Get all projects for this person
        for _, row in person_df.iterrows():
            project = {
                'name': row[project_col]
            }
            
            # Add engagement type if available
            if engagement_col:
                project['engagement_type'] = row[engagement_col]
            
            # Add allocation/utilization for this specific project
            if allocated_col and pd.api.types.is_numeric_dtype(person_df[allocated_col]):
                project['allocated'] = row[allocated_col]
            if utilized_col and pd.api.types.is_numeric_dtype(person_df[utilized_col]):
                project['utilized'] = row[utilized_col]
                if project.get('allocated', 0) > 0:
                    project['project_utilization'] = (project['utilized'] / project['allocated']) * 100
                else:
                    project['project_utilization'] = 0
            
            # Add Zoho data for this project
            if zoho_days_col and pd.api.types.is_numeric_dtype(person_df[zoho_days_col]):
                project['zoho_utilized'] = row[zoho_days_col]
                if project.get('allocated', 0) > 0:
                    project['zoho_utilization'] = (project['zoho_utilized'] / project['allocated']) * 100
                else:
                    project['zoho_utilization'] = 0
            
            person_data['projects'].append(project)
        
        resources.append(person_data)
    
    # Sort resources by name
    resources.sort(key=lambda x: x['name'])
    
    result['resources'] = resources
    
    # Add summary stats
    result['total_resources'] = len(resources)
    
    # Group resources by department
    if dept_col:
        dept_resources = {}
        for person in resources:
            dept = person.get('department', 'Unknown')
            if dept not in dept_resources:
                dept_resources[dept] = []
            dept_resources[dept].append(person['name'])
        
        result['resources_by_department'] = dept_resources
    
    return result


def process_zoho_data(df):
    """Process Zoho utilization data for comparison with project plan data"""
    result = {}
    
    if df.empty:
        return result
    
    # Standardize column names
    df.columns = [str(col).strip() for col in df.columns]
    
    # Find the relevant columns for project plan
    pp_utilized_col = next((col for col in df.columns 
                           if 'utilized' in col.lower() and '2025' in col.lower() and 'project plan' in col.lower()), None)
    
    # Find the relevant columns for Zoho
    zoho_days_col = next((col for col in df.columns if 'Zoho' in col and 'days' in col and '2025' in col), None)
    
    # Find department column
    dept_col = next((col for col in df.columns if col.lower() in ['department', 'dept']), None)
    
    # If we don't have both project plan and Zoho data, return empty result
    if not pp_utilized_col or not zoho_days_col:
        return result
    
    # Create comparison data by department if department column exists
    if dept_col:
        dept_pp = df.groupby(dept_col)[pp_utilized_col].sum().to_dict()
        dept_zoho = df.groupby(dept_col)[zoho_days_col].sum().to_dict()
        
        # Combine data for chart
        dept_comparison = []
        for dept in set(list(dept_pp.keys()) + list(dept_zoho.keys())):
            dept_comparison.append({
                'department': dept,
                'project_plan': dept_pp.get(dept, 0),
                'zoho': dept_zoho.get(dept, 0)
            })
        
        result['dept_comparison'] = dept_comparison
    
    # Create overall comparison data
    result['total_pp_utilized'] = df[pp_utilized_col].sum() if pd.api.types.is_numeric_dtype(df[pp_utilized_col]) else 0
    result['total_zoho_utilized'] = df[zoho_days_col].sum() if pd.api.types.is_numeric_dtype(df[zoho_days_col]) else 0
    
    return result


def link_billing_milestone_data(billing_df, milestone_df):
    """Create relationships between billing and milestone data if possible"""
    result = {}
    
    # Check if we have project identifiers in both datasets
    billing_project_col = next((col for col in billing_df.columns 
                               if 'Project' in col and 'Name' in col), None)
    milestone_project_col = next((col for col in milestone_df.columns
                                 if 'PROJECT' in col.upper() and ('DATA' in col.upper() or 'NAME' in col.upper())), None)
    
    if billing_project_col and milestone_project_col:
        # Attempt to match projects and analyze
        # This is simplified and would need customization based on actual data format
        result['has_linked_data'] = True
    else:
        result['has_linked_data'] = False
    
    return result