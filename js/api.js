const API_URL = 'http://localhost:5000/api';

// Contact Form API
const submitContactForm = async (formData) => {
    try {
        const response = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to submit form');
        }

        return await response.json();
    } catch (error) {
        console.error('Contact form submission error:', error);
        throw error;
    }
};

// Blog API
const getBlogPosts = async (page = 1, limit = 10) => {
    try {
        const response = await fetch(`${API_URL}/blog?page=${page}&limit=${limit}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch blog posts');
        }

        return await response.json();
    } catch (error) {
        console.error('Blog fetch error:', error);
        throw error;
    }
};

const getBlogPost = async (slug) => {
    try {
        const response = await fetch(`${API_URL}/blog/${slug}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch blog post');
        }

        return await response.json();
    } catch (error) {
        console.error('Blog post fetch error:', error);
        throw error;
    }
};
