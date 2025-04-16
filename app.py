"""
Resource Billing Dashboard Flask Application
Main application entry point
"""
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import os
import json
from werkzeug.utils import secure_filename
from utils.data_processor import process_excel_data
from utils.chart_generator import create_charts

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Used for flashing messages
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['ALLOWED_EXTENSIONS'] = {'xlsx', 'xls'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


def allowed_file(filename):
    """Check if the file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/', methods=['GET', 'POST'])
def index():
    """Landing page with file upload form"""
    if request.method == 'POST':
        # Check if file part exists
        if 'file' not in request.files:
            flash('No file part', 'error')
            return redirect(request.url)
        
        file = request.files['file']
        
        # If user doesn't select file
        if file.filename == '':
            flash('No selected file', 'error')
            return redirect(request.url)
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            return redirect(url_for('dashboard', filename=filename))
        else:
            flash('Invalid file type. Please upload an Excel file (.xlsx, .xls)', 'error')
            return redirect(request.url)
    
    return render_template('index.html')


@app.route('/dashboard/<filename>')
def dashboard(filename):
    """Main dashboard view showing visualizations"""
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    if not os.path.exists(file_path):
        flash(f'File not found: {filename}', 'error')
        return redirect(url_for('index'))
    
    try:
        # Process Excel data
        data = process_excel_data(file_path)
        
        # Check for processing errors
        if 'error' in data:
            flash(f'Error processing file: {data["error"]}', 'error')
            return redirect(url_for('index'))
        
        # Create charts
        charts = create_charts(data)
        
        # Render dashboard template with data and charts
        return render_template('dashboard.html', data=data, charts=charts, filename=filename)
        
    except Exception as e:
        flash(f'Error generating dashboard: {str(e)}', 'error')
        return redirect(url_for('index'))


@app.route('/resources/<filename>')
def resources(filename):
    """View all resources/people and their assignments"""
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    if not os.path.exists(file_path):
        flash(f'File not found: {filename}', 'error')
        return redirect(url_for('index'))
    
    try:
        # Process Excel data
        data = process_excel_data(file_path)
        
        # Check for processing errors
        if 'error' in data:
            flash(f'Error processing file: {data["error"]}', 'error')
            return redirect(url_for('index'))
        
        # Check if resources data is available
        if 'resources' not in data:
            flash('No resource data available in the file', 'warning')
            return redirect(url_for('dashboard', filename=filename))
        
        # Render resources template with data
        return render_template('resources.html', data=data, filename=filename)
        
    except Exception as e:
        # Add debugging output to see what's going wrong
        import traceback
        print(f"Error in resources view: {str(e)}")
        print(traceback.format_exc())
        flash(f'Error retrieving resource data: {str(e)}', 'error')
        return redirect(url_for('dashboard', filename=filename))


@app.route('/resource/<filename>/<resource_name>')
def resource_detail(filename, resource_name):
    """View details for a specific resource/person"""
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    if not os.path.exists(file_path):
        flash(f'File not found: {filename}', 'error')
        return redirect(url_for('index'))
    
    try:
        # Process Excel data
        data = process_excel_data(file_path)
        
        # Check for processing errors
        if 'error' in data:
            flash(f'Error processing file: {data["error"]}', 'error')
            return redirect(url_for('index'))
        
        # Find the specific resource
        resource = None
        if 'resources' in data:
            for person in data['resources']:
                if person['name'] == resource_name:
                    resource = person
                    break
        
        if not resource:
            flash(f'Resource not found: {resource_name}', 'error')
            return redirect(url_for('resources', filename=filename))
        
        # Render resource detail template
        return render_template('resource_detail.html', resource=resource, filename=filename)
        
    except Exception as e:
        flash(f'Error retrieving resource details: {str(e)}', 'error')
        return redirect(url_for('resources', filename=filename))


@app.route('/api/resources/<filename>')
def api_resources(filename):
    """API endpoint for resource data (for AJAX calls)"""
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    if not os.path.exists(file_path):
        return jsonify({'error': f'File not found: {filename}'}), 404
    
    try:
        # Process Excel data
        data = process_excel_data(file_path)
        
        # Check for processing errors
        if 'error' in data:
            return jsonify({'error': data['error']}), 500
        
        # Return resources data
        if 'resources' in data:
            return jsonify({'resources': data['resources']})
        else:
            return jsonify({'error': 'No resource data available'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/delete/<filename>', methods=['POST'])
def delete_file(filename):
    """Delete an uploaded file"""
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            flash(f'File {filename} deleted successfully', 'success')
        except Exception as e:
            flash(f'Error deleting file: {str(e)}', 'error')
    else:
        flash(f'File not found: {filename}', 'error')
    
    return redirect(url_for('index'))


@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors"""
    return render_template('index.html', error="Page not found"), 404


@app.errorhandler(500)
def server_error(e):
    """Handle 500 errors"""
    return render_template('index.html', error="Server error occurred"), 500

if __name__ == '__main__':
    app.run

#if __name__ == '__main__':
#    app.run(debug=True)
