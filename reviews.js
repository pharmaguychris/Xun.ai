import { submitReview, getReviews } from './js/supabase-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    const reviewForm = document.getElementById('reviewForm');
    const reviewsWall = document.getElementById('reviewsWall');
    
    // Load existing reviews
    await loadReviews();
    
    // Handle form submission
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const review = {
            name: document.getElementById('reviewName').value,
            rating: document.getElementById('reviewRating').value,
            text: document.getElementById('reviewText').value
        };
        
        try {
            // Save review to Supabase
            await submitReview(review);
            
            // Clear form
            reviewForm.reset();
            
            // Reload reviews
            await loadReviews();
            
            // Show success message
            showNotification('Review posted successfully!');
        } catch (error) {
            console.error('Error posting review:', error);
            showNotification('Failed to post review. Please try again.', 'error');
        }
    });
});

async function loadReviews() {
    try {
        const reviews = await getReviews();
        const reviewsWall = document.getElementById('reviewsWall');
        reviewsWall.innerHTML = ''; // Clear existing reviews
        
        reviews.forEach(review => {
            const reviewElement = createReviewElement(review);
            reviewsWall.insertBefore(reviewElement, reviewsWall.firstChild);
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
        showNotification('Failed to load reviews', 'error');
    }
}

function createReviewElement(review) {
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    
    const stars = '⭐'.repeat(parseInt(review.rating));
    
    reviewCard.innerHTML = `
        <div class="review-header">
            <div class="reviewer-name">${escapeHtml(review.name)}</div>
            <div class="review-rating">${stars}</div>
        </div>
        <div class="review-text">${escapeHtml(review.text)}</div>
        <div class="review-date">${new Date(review.created_at).toLocaleDateString()} at ${new Date(review.created_at).toLocaleTimeString()}</div>
    `;
    
    return reviewCard;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
