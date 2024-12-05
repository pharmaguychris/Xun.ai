document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav a');

    // Toggle mobile navigation
    navToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        document.body.classList.toggle('nav-open');
        
        // Animate hamburger icon
        navToggle.classList.toggle('active');
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') && 
            !nav.contains(e.target) && 
            !navToggle.contains(e.target)) {
            nav.classList.remove('active');
            document.body.classList.remove('nav-open');
            navToggle.classList.remove('active');
        }
    });

    // Close mobile nav when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            document.body.classList.remove('nav-open');
            navToggle.classList.remove('active');
        });
    });

    // Handle scroll
    let lastScroll = 0;
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Show/hide header on scroll
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    });
});
