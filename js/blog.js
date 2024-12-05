document.addEventListener('DOMContentLoaded', () => {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return;

    displayPosts();
    setupCategoryFilter();

    // Add click event listener to the blog grid
    blogGrid.addEventListener('click', (e) => {
        const blogCard = e.target.closest('.blog-card');
        if (blogCard) {
            // If clicked on admin controls, don't navigate
            if (e.target.closest('.post-admin-controls')) {
                return;
            }

            // Get the post ID from the card
            const link = blogCard.querySelector('.card-link');
            if (link) {
                const href = link.getAttribute('href');
                window.location.href = href;
            }
        }
    });
});

function isAdmin() {
    const session = JSON.parse(localStorage.getItem('adminSession') || 'null');
    if (!session) return false;

    const now = Date.now();
    const sessionAge = now - session.timestamp;
    const sessionLimit = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge >= sessionLimit) {
        localStorage.removeItem('adminSession');
        return false;
    }

    return session.isAuthenticated === true;
}

function createPostHTML(post) {
    const adminControls = isAdmin() ? `
        <div class="post-admin-controls">
            <a href="admin/post-editor.html?edit=${post.id}" class="edit-post">Edit</a>
            <button onclick="deletePost('${post.id}')" class="delete-post">Delete</button>
        </div>
    ` : '';

    return `
        <article class="blog-card ${post.featured ? 'featured-post' : ''}" data-category="${post.category}" data-id="${post.id}">
            ${adminControls}
            <a href="post.html?id=${post.id}" class="card-link">
                <div class="card-image">
                    <img src="${post.image || 'https://picsum.photos/800/500'}" alt="${post.title}">
                    <div class="card-category">${post.category}</div>
                </div>
                <div class="card-content">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="card-meta">
                        <span class="date">${new Date(post.date).toLocaleDateString()}</span>
                        <span class="read-time">${post.readTime} min read</span>
                    </div>
                    <span class="read-more">Read More <span class="arrow">→</span></span>
                </div>
            </a>
        </article>
    `;
}

function displayPosts() {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return;

    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]')
        .filter(post => post.status === 'published');

    // Sort posts: featured first, then by date
    posts.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.date) - new Date(a.date);
    });

    if (posts.length === 0) {
        blogGrid.innerHTML = '<div class="no-posts">No posts found</div>';
        return;
    }

    blogGrid.innerHTML = posts.map(post => createPostHTML(post)).join('');
}

function setupCategoryFilter() {
    const categoryFilter = document.querySelector('.category-filter');
    if (!categoryFilter) return;

    categoryFilter.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const category = e.target.dataset.category;
            filterPosts(category);
            
            // Update active state
            document.querySelectorAll('.category-filter button').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
        }
    });
}

function filterPosts(category) {
    const posts = document.querySelectorAll('.blog-card');
    posts.forEach(post => {
        if (category === 'all' || post.dataset.category === category) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
}

function deletePost(postId) {
    if (!isAdmin()) {
        window.location.href = 'admin/login.html';
        return;
    }

    if (confirm('Are you sure you want to delete this post?')) {
        const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        const updatedPosts = posts.filter(p => p.id !== postId);
        localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
        location.reload();
    }
}

// Make deletePost available globally
window.deletePost = deletePost;
