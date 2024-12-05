let currentPostId = null;

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

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!isAdmin()) {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
        return;
    }

    // Check if we're editing an existing post
    const urlParams = new URLSearchParams(window.location.search);
    const editPostId = urlParams.get('edit');
    
    if (editPostId) {
        loadPostForEditing(editPostId);
    }

    // Mock AI generation function (replace with actual API calls in production)
    async function generateWithAI(title, options) {
        const loadingStates = {
            start: () => {
                generateBtn.classList.add('loading');
                generateBtn.disabled = true;
            },
            end: () => {
                generateBtn.classList.remove('loading');
                generateBtn.disabled = false;
            }
        };

        try {
            loadingStates.start();
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const style = document.getElementById('contentStyle').value;
            const topics = {
                'projects': ['no-code development', 'web applications', 'automation'],
                'startup': ['entrepreneurship', 'business growth', 'team building'],
                'ai-tools': ['artificial intelligence', 'machine learning', 'automation']
            };

            const category = document.getElementById('category').value;
            const relatedTopics = topics[category] || topics['ai-tools'];

            // Generate content based on title and style
            if (options.generateImage) {
                document.getElementById('image').value = `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 100)}`;
            }

            if (options.generateExcerpt) {
                const excerpts = {
                    'professional': `A comprehensive analysis of ${title} and its impact on ${relatedTopics[0]}.`,
                    'casual': `Let's dive into ${title} and see how it's changing the game in ${relatedTopics[0]}!`,
                    'technical': `An in-depth technical exploration of ${title} focusing on ${relatedTopics[1]}.`,
                    'storytelling': `Discover the journey of ${title} and how it transformed our approach to ${relatedTopics[2]}.`
                };
                document.getElementById('excerpt').value = excerpts[style];
            }

            if (options.generateFullPost) {
                const content = {
                    'professional': `# ${title}\n\nIn today's rapidly evolving landscape of ${relatedTopics[0]}, professionals are constantly seeking innovative solutions. This article explores how ${title} is revolutionizing the industry.\n\n## Key Benefits\n\n1. Enhanced Productivity\n2. Streamlined Workflows\n3. Cost Efficiency\n\n## Implementation Strategy\n\nTo successfully implement ${title}, organizations should consider the following steps...`,
                    'casual': `Hey there! 👋\n\nExcited to share something awesome with you today - let's talk about ${title}! You won't believe how this is changing everything we know about ${relatedTopics[0]}.\n\n## Why This Matters\n\nFirst off, let me tell you why this is such a game-changer...`,
                    'technical': `# Technical Overview: ${title}\n\n## Architecture\n\nThe implementation of ${title} follows a modular approach, incorporating the following components:\n\n1. Core Engine\n2. API Layer\n3. Integration Framework\n\n## Technical Specifications\n\nKey performance metrics and implementation details...`,
                    'storytelling': `The Journey Begins\n\nIt was a typical Tuesday morning when we first conceived the idea of ${title}. Little did we know how it would transform our entire approach to ${relatedTopics[2]}.\n\n## The Challenge\n\nWe faced a seemingly insurmountable challenge...`
                };
                document.getElementById('content').value = content[style];
            }

            // Set default read time based on content length
            document.getElementById('readTime').value = Math.max(5, Math.floor(document.getElementById('content').value.length / 400));

            updatePreview();
        } catch (error) {
            console.error('Error generating content:', error);
            alert('Error generating content. Please try again.');
        } finally {
            loadingStates.end();
        }
    }

    // Generate a unique ID for the post
    function generatePostId(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    // Update preview as user types
    function updatePreview() {
        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const image = document.getElementById('image').value;
        const excerpt = document.getElementById('excerpt').value;
        const readTime = document.getElementById('readTime').value;

        preview.innerHTML = `
            <article class="blog-card">
                <div class="card-image">
                    <img src="${image || 'https://picsum.photos/600/400'}" alt="${title}">
                    <div class="card-category">${category}</div>
                </div>
                <div class="card-content">
                    <h3>${title || 'Post Title'}</h3>
                    <p>${excerpt || 'Post excerpt will appear here...'}</p>
                    <div class="card-meta">
                        <span class="date">${new Date().toLocaleDateString()}</span>
                        <span class="read-time">${readTime || '0'} min read</span>
                    </div>
                </div>
            </article>
        `;
    }

    function loadPostForEditing(postId) {
        const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        const post = posts.find(p => p.id === postId);
        
        if (post) {
            currentPostId = postId;
            document.getElementById('title').value = post.title;
            document.getElementById('category').value = post.category;
            document.getElementById('image').value = post.image;
            document.getElementById('content').value = post.content;
            document.getElementById('excerpt').value = post.excerpt;
            document.getElementById('readTime').value = post.readTime;
            
            // Update UI to show we're editing
            document.querySelector('h1').textContent = 'Edit Post';
            document.getElementById('publish-btn').textContent = 'Update Post';
        }
    }

    // Save post data
    function savePost(isDraft = false) {
        // Check admin status again for security
        if (!isAdmin()) {
            window.location.href = 'login.html';
            return;
        }

        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const image = document.getElementById('image').value;
        const content = document.getElementById('content').value;
        const excerpt = document.getElementById('excerpt').value;
        const readTime = document.getElementById('readTime').value;

        if (!title || !category || !content) {
            alert('Please fill in all required fields');
            return;
        }

        const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        
        const post = {
            id: currentPostId || generatePostId(title),
            title,
            category,
            image,
            content,
            excerpt,
            readTime,
            date: currentPostId ? posts.find(p => p.id === currentPostId).date : new Date().toISOString(),
            status: isDraft ? 'draft' : 'published',
            featured: document.getElementById('featured').checked
        };

        if (currentPostId) {
            // Update existing post
            const index = posts.findIndex(p => p.id === currentPostId);
            if (index !== -1) {
                posts[index] = { ...posts[index], ...post };
            }
        } else {
            // Add new post
            posts.push(post);
        }

        localStorage.setItem('blogPosts', JSON.stringify(posts));
        
        // Redirect to the post detail page
        window.location.href = `/post.html?id=${post.id}`;
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Event listeners
    const form = document.getElementById('blogPostForm');
    const preview = document.querySelector('.preview-content');
    const saveDraftBtn = document.getElementById('saveDraft');
    const generateBtn = document.getElementById('generateContent');
    const aiOptions = document.getElementById('aiOptions');

    generateBtn.addEventListener('click', () => {
        const title = document.getElementById('title').value;
        if (!title) {
            alert('Please enter a title first!');
            return;
        }
        aiOptions.style.display = aiOptions.style.display === 'none' ? 'block' : 'none';
        if (aiOptions.style.display === 'block') {
            generateWithAI(title, {
                generateImage: document.getElementById('generateImage').checked,
                generateExcerpt: document.getElementById('generateExcerpt').checked,
                generateFullPost: document.getElementById('generateFullPost').checked
            });
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        savePost(false);
    });

    saveDraftBtn.addEventListener('click', () => {
        savePost(true);
    });

    // Update preview on input
    form.addEventListener('input', updatePreview);

    // Initial preview
    updatePreview();
});
