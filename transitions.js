document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in class when page loads
    document.body.classList.add('fade-in');

    // Remove fade-in class after animation completes
    setTimeout(() => {
        document.body.classList.remove('fade-in');
    }, 500);
    
    // Handle all navigation links
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', e => {
            // Skip external links or anchor links
            const isExternal = link.href.startsWith('http') && !link.href.includes(window.location.host);
            const isAnchor = link.href.includes('#') && link.href.split('#')[0] === window.location.href.split('#')[0];
            
            if (isExternal || isAnchor) return;

            e.preventDefault();
            
            // Add fade-out effect
            document.body.classList.add('fade-out');
            
            // Store the target URL
            const targetUrl = link.href;
            
            // Navigate after transition
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 300);
        });
    });
});
