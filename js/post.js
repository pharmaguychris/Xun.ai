document.addEventListener('DOMContentLoaded', () => {
    // Get post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        window.location.href = 'blog.html';
        return;
    }

    // Load post data
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const post = posts.find(p => p.id === postId);

    if (!post) {
        window.location.href = 'blog.html';
        return;
    }

    // Setup admin controls
    setupAdminControls(post);

    // Update page title
    document.title = `${post.title} - Xun.ai`;

    // Update post content
    document.querySelector('.post-meta .category').textContent = post.category;
    document.querySelector('.post-meta .date').textContent = new Date(post.date).toLocaleDateString();
    document.querySelector('.post-meta .read-time').textContent = `${post.readTime} min read`;
    document.querySelector('.post-title').textContent = post.title;
    document.querySelector('.post-image img').src = post.image;
    document.querySelector('.post-image img').alt = post.title;

    // Convert markdown to HTML and set post content
    const postContent = convertMarkdownToHTML(post.content);
    document.querySelector('.post-body').innerHTML = postContent;

    // Setup share buttons
    setupShareButtons(post);

    // Setup comments
    setupComments(post.id);
});

// Simple markdown to HTML converter
function convertMarkdownToHTML(markdown) {
    return markdown
        // Headers
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^\s*\d+\.\s+(.*$)/gm, '<ol><li>$1</li></ol>')
        .replace(/^\s*[\-\*]\s+(.*$)/gm, '<ul><li>$1</li></ul>')
        // Links
        .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>')
        // Code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Paragraphs
        .replace(/\n\n/g, '</p><p>')
        // Clean up empty paragraphs
        .replace(/<p><\/p>/g, '')
        // Wrap in paragraph tags
        .replace(/^(.+)$/gm, '<p>$1</p>');
}

// Setup social share buttons
function setupShareButtons(post) {
    const shareData = {
        title: post.title,
        text: post.excerpt,
        url: window.location.href
    };

    // Twitter share
    document.querySelector('.share-btn.twitter').addEventListener('click', () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`;
        window.open(twitterUrl, '_blank');
    });

    // LinkedIn share
    document.querySelector('.share-btn.linkedin').addEventListener('click', () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
        window.open(linkedinUrl, '_blank');
    });

    // Facebook share
    document.querySelector('.share-btn.facebook').addEventListener('click', () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(facebookUrl, '_blank');
    });

    // Native share if available
    if (navigator.share) {
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    console.log('Error sharing:', err);
                }
            });
        });
    }
}

// Setup comments functionality
function setupComments(postId) {
    const commentsList = document.querySelector('.comments-list');
    const commentForm = document.getElementById('commentForm');

    // Load existing comments
    loadComments(postId);

    // Handle new comment submission
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const commentText = document.getElementById('comment').value;

        addComment(postId, name, email, commentText);
        commentForm.reset();
    });
}

// Load comments for a post
function loadComments(postId) {
    const commentsList = document.querySelector('.comments-list');
    const comments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');

    if (comments.length === 0) {
        commentsList.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
        return;
    }

    commentsList.innerHTML = comments
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(comment => createCommentHTML(comment))
        .join('');

    // Setup delete buttons for admin
    const session = JSON.parse(localStorage.getItem('adminSession') || 'null');
    if (session) {
        setupCommentDeleteButtons(postId);
    }
}

// Add a new comment
function addComment(postId, name, email, content) {
    const comments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
    
    const newComment = {
        id: Date.now().toString(36),
        name,
        email,
        content,
        date: new Date().toISOString()
    };

    comments.push(newComment);
    localStorage.setItem(`comments_${postId}`, JSON.stringify(comments));
    loadComments(postId);
}

// Delete a comment (admin only)
function deleteComment(postId, commentId) {
    const session = JSON.parse(localStorage.getItem('adminSession') || 'null');
    if (!session) return;

    const comments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    localStorage.setItem(`comments_${postId}`, JSON.stringify(updatedComments));
    loadComments(postId);
}

// Create HTML for a comment
function createCommentHTML(comment) {
    const date = new Date(comment.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const session = JSON.parse(localStorage.getItem('adminSession') || 'null');
    const deleteButton = session ? `
        <div class="comment-actions">
            <button class="delete-comment" data-comment-id="${comment.id}">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    ` : '';

    return `
        <div class="comment" id="comment-${comment.id}">
            <div class="comment-header">
                <span class="comment-author">${escapeHtml(comment.name)}</span>
                <span class="comment-date">${date}</span>
            </div>
            <div class="comment-content">${escapeHtml(comment.content)}</div>
            ${deleteButton}
        </div>
    `;
}

// Setup delete buttons for admin
function setupCommentDeleteButtons(postId) {
    document.querySelectorAll('.delete-comment').forEach(button => {
        button.addEventListener('click', () => {
            const commentId = button.dataset.commentId;
            if (confirm('Are you sure you want to delete this comment?')) {
                deleteComment(postId, commentId);
            }
        });
    });
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Check if user is admin
function isAdmin() {
    const session = JSON.parse(localStorage.getItem('adminSession') || 'null');
    if (!session) return false;

    // Check if session is expired (24 hours)
    const now = Date.now();
    const sessionAge = now - session.timestamp;
    const sessionLimit = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge >= sessionLimit) {
        localStorage.removeItem('adminSession');
        return false;
    }

    return true;
}

// Setup admin controls
function setupAdminControls(post) {
    const adminControls = document.querySelector('.admin-controls');
    
    // Only show admin controls if user is logged in
    if (!isAdmin()) {
        adminControls.style.display = 'none';
        return;
    }

    // Show admin controls
    adminControls.style.display = 'flex';

    const editBtn = document.querySelector('.edit-post-btn');
    const deleteBtn = document.querySelector('.delete-post-btn');

    // Add edit functionality
    editBtn.addEventListener('click', () => {
        window.location.href = `admin/post-editor.html?edit=${post.id}`;
    });

    // Add delete functionality
    deleteBtn.addEventListener('click', () => {
        showDeleteConfirmation(post);
    });
}

// Show delete confirmation modal
function showDeleteConfirmation(post) {
    // Check admin status again for security
    if (!isAdmin()) {
        window.location.href = 'admin/login.html';
        return;
    }

    // Create modal if it doesn't exist
    let modal = document.querySelector('.delete-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal delete-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3 class="modal-title">Delete Post</h3>
                <p>Are you sure you want to delete "${post.title}"?</p>
                <p>This action cannot be undone.</p>
                <div class="modal-buttons">
                    <button class="confirm-delete">Delete</button>
                    <button class="cancel-delete">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Show modal
    modal.classList.add('active');

    // Add event listeners
    const confirmBtn = modal.querySelector('.confirm-delete');
    const cancelBtn = modal.querySelector('.cancel-delete');

    confirmBtn.addEventListener('click', () => {
        deletePost(post.id);
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

// Delete post
function deletePost(postId) {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const updatedPosts = posts.filter(p => p.id !== postId);
    localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
    window.location.href = 'blog.html';
}
