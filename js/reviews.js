import { supabase } from './supabase-config.js';

// Function to create a review card
function createReviewCard(review) {
    console.log('Creating review card for:', review);
    const card = document.createElement('div');
    card.className = 'review-card';
    
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const date = new Date(review.created_at).toLocaleDateString();
    
    card.innerHTML = `
        <div class="review-header">
            <span class="reviewer-name">${review.name}</span>
            <span class="review-rating">${stars}</span>
        </div>
        <p class="review-text">${review.text}</p>
        <div class="review-date">${date}</div>
    `;
    
    return card;
}

// Smooth scrolling functionality
let scrollPosition = 0;
let SCROLL_SPEED = 0.15;
let originalCards = [];
let isResetting = false;
let animationFrameId = null;
let isAnimationPaused = false;

function manageInfiniteScroll() {
    const track = document.querySelector('.reviews-track');
    if (!track || isResetting || isAnimationPaused) return;

    const cards = track.children;
    if (cards.length === 0) return;

    const cardWidth = cards[0].offsetWidth + 32; // Including gap
    const totalWidth = cardWidth * (originalCards.length); // Width of one set of cards

    scrollPosition -= SCROLL_SPEED;

    // When we've scrolled one full set width
    if (Math.abs(scrollPosition) >= totalWidth) {
        scrollPosition = 0; // Reset to start immediately
    }

    track.style.transform = `translateX(${scrollPosition}px)`;
    animationFrameId = requestAnimationFrame(manageInfiniteScroll);
}

function stopAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    isAnimationPaused = true;
}

function startAnimation() {
    if (!animationFrameId) {
        isAnimationPaused = false;
        scrollPosition = 0;
        animationFrameId = requestAnimationFrame(manageInfiniteScroll);
    }
}

// Function to load reviews
async function loadReviews() {
    console.log('Loading reviews...');
    const reviewsTrack = document.querySelector('.reviews-track');
    if (!reviewsTrack) {
        console.error('Reviews track element not found!');
        return;
    }

    try {
        // Stop current animation
        stopAnimation();

        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .order('rating', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log('Fetched reviews:', reviews);
        
        if (reviews && reviews.length > 0) {
            // Store original reviews
            originalCards = reviews;

            // Wait for DOM update to complete
            await new Promise(resolve => {
                requestAnimationFrame(() => {
                    reviewsTrack.innerHTML = ''; // Clear existing reviews
                    // Create four sets of reviews for smoother infinite scroll
                    const reviewSets = [...reviews, ...reviews, ...reviews, ...reviews];
                    reviewSets.forEach(review => {
                        reviewsTrack.appendChild(createReviewCard(review));
                    });
                    resolve();
                });
            });

            console.log('Reviews displayed successfully');
            
            // Start new animation
            startAnimation();
        } else {
            reviewsTrack.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to share your experience!</p>';
            console.log('No reviews found');
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        reviewsTrack.innerHTML = '<p class="error-message">Failed to load reviews. Please try again later.</p>';
    }
}

// Initialize reviews functionality
function initReviews() {
    console.log('Initializing reviews functionality...');
    
    // Load initial reviews
    loadReviews();
    
    // Set up form submission
    const reviewForm = document.getElementById('reviewForm');
    const modal = document.getElementById('reviewFormModal');
    const writeReviewBtn = document.getElementById('writeReviewBtn');
    const closeModalBtn = document.getElementById('closeReviewForm');
    const reviewsContainer = document.querySelector('.reviews-carousel-container');

    if (reviewForm && modal && writeReviewBtn && closeModalBtn) {
        console.log('Review form and modal elements found, setting up handlers');
        
        // Open modal
        writeReviewBtn.addEventListener('click', () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });

        // Close modal
        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            reviewForm.reset(); // Reset form
        };

        closeModalBtn.addEventListener('click', closeModal);

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Handle form submission
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = reviewForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            
            try {
                const formData = new FormData(reviewForm);
                const review = {
                    name: formData.get('name'),
                    rating: parseInt(formData.get('rating')),
                    text: formData.get('text')
                };

                console.log('Submitting review:', review);

                const { data, error } = await supabase
                    .from('reviews')
                    .insert([review])
                    .select();

                if (error) {
                    console.error('Supabase error:', error);
                    throw error;
                }

                console.log('Review submitted successfully:', data);

                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.innerHTML = `
                    <span>✨</span>
                    <span>Thank you for your review!</span>
                `;
                reviewForm.appendChild(successMessage);

                // Close modal and reset form after delay
                setTimeout(async () => {
                    closeModal();
                    successMessage.remove();
                    // Reload reviews with proper animation handling
                    await loadReviews();
                }, 2000);

            } catch (error) {
                console.error('Error submitting review:', error);
                alert('Failed to submit review. Please try again.');
            } finally {
                submitButton.disabled = false;
            }
        });
    } else {
        console.error('Required modal elements not found!');
    }

    // Pause scrolling when hovering over reviews
    if (reviewsContainer) {
        reviewsContainer.addEventListener('mouseenter', stopAnimation);
        reviewsContainer.addEventListener('mouseleave', startAnimation);
    }
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', initReviews);

// Export functions for testing
export { loadReviews };
