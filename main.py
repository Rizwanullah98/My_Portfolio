from flask import Flask, send_from_directory, request, jsonify
import os
import json
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

@app.route('/')
def index():
    """Serve the main portfolio page"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    try:
        return send_from_directory('.', filename)
    except FileNotFoundError:
        return f"File not found: {filename}", 404

@app.route('/contact.php', methods=['POST'])
def contact_form():
    """Handle contact form submission"""
    try:
        # Get form data
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        message = request.form.get('message', '').strip()
        
        # Basic validation
        errors = []
        
        if not name:
            errors.append('Name is required.')
        elif len(name) < 2:
            errors.append('Name must be at least 2 characters long.')
        
        if not email:
            errors.append('Email is required.')
        elif '@' not in email or '.' not in email:
            errors.append('Please enter a valid email address.')
        
        if not message:
            errors.append('Message is required.')
        elif len(message) < 10:
            errors.append('Message must be at least 10 characters long.')
        
        if errors:
            return jsonify({
                'success': False,
                'message': ' '.join(errors)
            }), 400
        
        # Log the form submission (in a real app, you'd send an email here)
        app.logger.info(f"Contact form submission: {name} ({email}) - {message[:50]}...")
        
        # Return success response
        return jsonify({
            'success': True,
            'message': 'Thank you for your message! I\'ll get back to you as soon as possible.'
        })
        
    except Exception as e:
        app.logger.error(f"Contact form error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred while processing your request. Please try again.'
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return "Page not found", 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return "Internal server error", 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)