document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    // Check if already logged in
    if (isLoggedIn()) {
        redirectToAdmin();
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const success = await login(username, password);
            if (success) {
                redirectToAdmin();
            } else {
                showError('Invalid username or password');
            }
        } catch (error) {
            showError('Login failed. Please try again.');
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});

function login(username, password) {
    return new Promise((resolve) => {
        // In a real application, this would be an API call
        // For demo purposes, we're using a hardcoded admin/admin credentials
        const isValid = username === 'admin' && password === 'admin';
        
        if (isValid) {
            // Set session
            localStorage.setItem('adminSession', JSON.stringify({
                username: username,
                timestamp: Date.now(),
                // In production, this would be a proper JWT token
                token: btoa(username + Date.now())
            }));
        }
        
        resolve(isValid);
    });
}

function isLoggedIn() {
    const session = JSON.parse(localStorage.getItem('adminSession') || 'null');
    if (!session) return false;

    // Check if session is expired (24 hours)
    const now = Date.now();
    const sessionAge = now - session.timestamp;
    const sessionLimit = 24 * 60 * 60 * 1000; // 24 hours

    return sessionAge < sessionLimit;
}

function redirectToAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect') || 'post-editor.html';
    window.location.href = redirect;
}
