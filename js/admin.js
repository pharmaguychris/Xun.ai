import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '/login.html';
        return;
    }

    // Setup navigation
    setupNavigation();
    
    // Load initial content
    loadContacts();

    // Setup logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
});

function setupNavigation() {
    const navButtons = document.querySelectorAll('.admin-nav button');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Load content
            const tab = button.dataset.tab;
            switch(tab) {
                case 'contacts':
                    loadContacts();
                    break;
                case 'blog':
                    loadBlogPosts();
                    break;
                case 'reviews':
                    loadReviews();
                    break;
            }
        });
    });
}

async function loadContacts() {
    const content = document.querySelector('.admin-content');
    try {
        const { data: contacts, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .order('submitted_at', { ascending: false });

        if (error) throw error;

        content.innerHTML = `
            <h2>Contact Submissions</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${contacts.map(contact => `
                        <tr>
                            <td>${new Date(contact.submitted_at).toLocaleDateString()}</td>
                            <td>${escapeHtml(contact.name)}</td>
                            <td>${escapeHtml(contact.email)}</td>
                            <td>${escapeHtml(contact.message)}</td>
                            <td><span class="status-${contact.status}">${contact.status}</span></td>
                            <td>
                                <button class="action-btn edit-btn" onclick="markAsRead('${contact.id}')">Mark as Read</button>
                                <button class="action-btn delete-btn" onclick="deleteContact('${contact.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading contacts:', error);
        showError('Failed to load contacts');
    }
}

async function loadBlogPosts() {
    const content = document.querySelector('.admin-content');
    try {
        const { data: posts, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        content.innerHTML = `
            <h2>Blog Posts</h2>
            <button class="action-btn edit-btn" onclick="showNewPostForm()">New Post</button>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Published</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${posts.map(post => `
                        <tr>
                            <td>${escapeHtml(post.title)}</td>
                            <td>${post.status}</td>
                            <td>${post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}</td>
                            <td>
                                <button class="action-btn edit-btn" onclick="editPost('${post.id}')">Edit</button>
                                <button class="action-btn delete-btn" onclick="deletePost('${post.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading blog posts:', error);
        showError('Failed to load blog posts');
    }
}

async function loadReviews() {
    const content = document.querySelector('.admin-content');
    try {
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        content.innerHTML = `
            <h2>Reviews</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${reviews.map(review => `
                        <tr>
                            <td>${new Date(review.created_at).toLocaleDateString()}</td>
                            <td>${escapeHtml(review.name)}</td>
                            <td>${'⭐'.repeat(review.rating)}</td>
                            <td>${escapeHtml(review.text)}</td>
                            <td>
                                <button class="action-btn delete-btn" onclick="deleteReview('${review.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading reviews:', error);
        showError('Failed to load reviews');
    }
}

async function handleLogout() {
    try {
        await supabase.auth.signOut();
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Error logging out:', error);
        showError('Failed to log out');
    }
}

function showError(message) {
    // Implement error notification
    alert(message);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Make functions available globally for onclick handlers
window.markAsRead = async (id) => {
    try {
        const { error } = await supabase
            .from('contact_submissions')
            .update({ status: 'read' })
            .eq('id', id);

        if (error) throw error;
        loadContacts();
    } catch (error) {
        console.error('Error marking as read:', error);
        showError('Failed to update status');
    }
};

window.deleteContact = async (id) => {
    if (!confirm('Are you sure you want to delete this contact submission?')) return;
    
    try {
        const { error } = await supabase
            .from('contact_submissions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        loadContacts();
    } catch (error) {
        console.error('Error deleting contact:', error);
        showError('Failed to delete contact');
    }
};

window.deleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);

        if (error) throw error;
        loadReviews();
    } catch (error) {
        console.error('Error deleting review:', error);
        showError('Failed to delete review');
    }
};
