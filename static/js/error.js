// error.js - Optional additional functionality for the error page

document.addEventListener('DOMContentLoaded', function() {
    // Auto-reload functionality for service unavailable errors
    if (document.querySelector('.error-code').textContent.includes('503')) {
        let countdown = 30; // 30 second countdown
        const countdownDisplay = document.createElement('div');
        countdownDisplay.className = 'countdown-timer';
        countdownDisplay.innerHTML = `<p>Attempting to reconnect in <span id="countdown">${countdown}</span> seconds...</p>`;
        
        // Insert after error message
        document.querySelector('.error-message').after(countdownDisplay);
        
        // Start countdown
        const timer = setInterval(function() {
            countdown--;
            document.getElementById('countdown').textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(timer);
                window.location.reload();
            }
        }, 1000);
        
        // Allow user to cancel auto-reload
        const cancelButton = document.createElement('button');
        cancelButton.className = 'btn btn-sm btn-outline-secondary mt-2';
        cancelButton.textContent = 'Cancel Auto-Reload';
        cancelButton.onclick = function() {
            clearInterval(timer);
            countdownDisplay.innerHTML = '<p>Auto-reload cancelled</p>';
            setTimeout(() => countdownDisplay.remove(), 2000);
        };
        
        countdownDisplay.appendChild(cancelButton);
    }
    
    // Error reporting functionality
    const reportButton = document.createElement('button');
    reportButton.className = 'btn btn-link text-muted mt-3';
    reportButton.innerHTML = '<i class="bi bi-flag"></i> Report this error';
    
    reportButton.onclick = function() {
        // Get error information
        const errorCode = document.querySelector('.error-code').textContent;
        const errorTitle = document.querySelector('.error-title').textContent;
        const errorMessage = document.querySelector('.error-message').textContent;
        const errorDetails = document.querySelector('.alert-danger') ? 
                             document.querySelector('.alert-danger').textContent : '';
        
        // Create error report content
        const errorReport = `
            Error: ${errorCode}
            Title: ${errorTitle}
            Message: ${errorMessage}
            Details: ${errorDetails}
            URL: ${window.location.href}
            Date: ${new Date().toISOString()}
            User Agent: ${navigator.userAgent}
        `;
        
        // In a real app, you would send this to your server
        console.log('Error report:', errorReport);
        
        // Show confirmation to user
        alert('Thank you for reporting this error. Our technical team has been notified.');
    };
    
    // Add the report button to the page
    document.querySelector('.support-info').appendChild(reportButton);
});