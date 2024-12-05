// Initialize libraries
gsap.registerPlugin(ScrollTrigger);
AOS.init({
    duration: 800,
    once: true
});

// Custom cursor
const cursor = {
    dot: document.querySelector('.cursor-dot'),
    outline: document.querySelector('.cursor-outline'),
    init: function() {
        window.addEventListener('mousemove', (e) => {
            gsap.to(this.dot, {
                x: e.clientX,
                y: e.clientY,
                duration: 0,
            });
            gsap.to(this.outline, {
                x: e.clientX - 15,
                y: e.clientY - 15,
                duration: 0.2,
            });
        });

        // Hover effect on links
        document.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(this.outline, {
                    scale: 1.5,
                    duration: 0.3,
                });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(this.outline, {
                    scale: 1,
                    duration: 0.3,
                });
            });
        });
    }
};

// Loader animation
const loader = {
    init: function() {
        const tl = gsap.timeline();
        tl.to('.loader-progress', {
            width: '100%',
            duration: 1.5,
            ease: 'power2.inOut'
        })
        .to('.loader', {
            yPercent: -100,
            duration: 0.8,
            ease: 'power2.inOut'
        })
        .from('.logo', {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out'
        })
        .from('.nav-links li', {
            y: 50,
            opacity: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: 'power2.out'
        }, '-=0.4');
    }
};

// Smooth scroll
const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    smartphone: {
        smooth: true
    },
    tablet: {
        smooth: true
    }
});

// Text split animation
document.querySelectorAll('.split-text').forEach(text => {
    new SplitType(text, { types: 'words, chars' });
    gsap.from(text.querySelectorAll('.char'), {
        opacity: 0,
        y: 20,
        duration: 0.7,
        stagger: 0.02,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: text,
            start: 'top 80%'
        }
    });
});

// Initialize particles.js
particlesJS('particles-js', {
    particles: {
        number: {
            value: 80,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: '#ffffff'
        },
        shape: {
            type: 'circle'
        },
        opacity: {
            value: 0.5,
            random: true,
            animation: {
                enable: true,
                speed: 1,
                minimumValue: 0.1,
                sync: false
            }
        },
        size: {
            value: 3,
            random: true,
            animation: {
                enable: true,
                speed: 2,
                minimumValue: 0.1,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#ffffff',
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: true,
            straight: false,
            outMode: 'out',
            bounce: false,
        }
    },
    interactivity: {
        detectsOn: 'canvas',
        events: {
            onHover: {
                enable: true,
                mode: 'grab'
            },
            onClick: {
                enable: true,
                mode: 'push'
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 140,
                lineLinked: {
                    opacity: 1
                }
            },
            push: {
                particles_nb: 4
            }
        }
    },
    retina_detect: true
});

// Enhanced shape animations
const shapes = document.querySelectorAll('.shape');
shapes.forEach((shape) => {
    const speed = shape.getAttribute('data-speed');
    const randomX = Math.random() * 100 - 50;
    const randomY = Math.random() * 100 - 50;
    
    gsap.to(shape, {
        x: randomX,
        y: randomY,
        rotation: Math.random() * 360,
        duration: Math.abs(speed) * 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
    });
});

// Parallax effect on mouse move
const hero = document.querySelector('.hero');
hero.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    const xPos = (clientX / innerWidth - 0.5) * 2;
    const yPos = (clientY / innerHeight - 0.5) * 2;
    
    shapes.forEach((shape) => {
        const speed = shape.getAttribute('data-speed');
        const x = xPos * 50 * speed;
        const y = yPos * 50 * speed;
        
        gsap.to(shape, {
            x: `+=${x}`,
            y: `+=${y}`,
            duration: 1,
            ease: 'power3.out',
        });
    });
});

// Text reveal animation
const heroText = document.querySelector('.hero h1');
const subtitle = document.querySelector('.hero-subtitle');

gsap.from(heroText, {
    duration: 1.5,
    y: 100,
    opacity: 0,
    ease: 'power4.out',
    delay: 0.5,
});

gsap.from(subtitle, {
    duration: 1.5,
    y: 50,
    opacity: 0,
    ease: 'power4.out',
    delay: 0.8,
});

// Add magnetic effect to CTA button
const ctaButton = document.querySelector('.hero .cta-button');
if (ctaButton) {
    ctaButton.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = ctaButton.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        
        const xc = width / 2;
        const yc = height / 2;
        
        const dx = x - xc;
        const dy = y - yc;
        
        gsap.to(ctaButton, {
            x: dx * 0.3,
            y: dy * 0.3,
            duration: 0.5,
            ease: 'power3.out',
        });
    });
    
    ctaButton.addEventListener('mouseleave', () => {
        gsap.to(ctaButton, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)',
        });
    });
}

// Parallax effect on scroll
document.querySelectorAll('[data-speed]').forEach(section => {
    gsap.to(section, {
        y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed,
        ease: 'none',
        scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'max',
            invalidateOnRefresh: true,
            scrub: true
        }
    });
});

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    cursor.init();
    loader.init();
    
    // Refresh scroll trigger
    ScrollTrigger.refresh();
});
