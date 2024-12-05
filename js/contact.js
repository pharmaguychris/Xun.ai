import { submitContactForm } from './supabase-service.js';

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const inputs = contactForm.querySelectorAll('input, textarea');

    // Add floating label behavior
    inputs.forEach(input => {
        // Set initial state for pre-filled inputs
        if (input.value) {
            input.classList.add('has-value');
        }

        // Handle input changes
        input.addEventListener('input', () => {
            if (input.value) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        });
    });

    // Handle form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = contactForm.querySelector('.submit-btn');
        const originalButtonText = submitButton.innerHTML;

        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span class="btn-text">Sending...</span>
            <span class="btn-icon">⏳</span>
        `;

        try {
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Send data to backend
            await submitContactForm(data);

            // Show success message
            showSuccessMessage();

            // Reset form
            contactForm.reset();
            inputs.forEach(input => input.classList.remove('has-value'));

        } catch (error) {
            console.error('Error sending message:', error);
            showErrorMessage();
        } finally {
            // Restore button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
});

// Success message handler
function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <span style="font-size: 1.5rem;">✨</span>
        <div>
            <h4 style="margin: 0; color: #2d3436;">Message Sent!</h4>
            <p style="margin: 5px 0 0; color: #636e72;">I'll get back to you soon.</p>
        </div>
    `;

    document.body.appendChild(message);

    // Remove message after delay
    setTimeout(() => {
        message.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Error message handler
function showErrorMessage() {
    const message = document.createElement('div');
    message.className = 'success-message error';
    message.innerHTML = `
        <span style="font-size: 1.5rem;">❌</span>
        <div>
            <h4 style="margin: 0; color: #e17055;">Oops!</h4>
            <p style="margin: 5px 0 0; color: #636e72;">Please try again later.</p>
        </div>
    `;

    document.body.appendChild(message);

    // Remove message after delay
    setTimeout(() => {
        message.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}
