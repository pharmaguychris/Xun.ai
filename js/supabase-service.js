import { supabase } from './supabase-config.js';

// Contact Form Service
export const submitContactForm = async (formData) => {
    try {
        const { data, error } = await supabase
            .from('contact_submissions')
            .insert([
                {
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    status: 'new',
                    submitted_at: new Date().toISOString()
                }
            ]);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error submitting contact form:', error);
        throw new Error('Failed to submit contact form');
    }
};

// Blog Service
export const getBlogPosts = async (page = 1, limit = 10) => {
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data: posts, count, error } = await supabase
            .from('blog_posts')
            .select('*', { count: 'exact' })
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        return {
            posts,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            total: count
        };
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        throw new Error('Failed to fetch blog posts');
    }
};

export const getBlogPost = async (slug) => {
    try {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching blog post:', error);
        throw new Error('Failed to fetch blog post');
    }
};

// Reviews Service
export const submitReview = async (reviewData) => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert([
                {
                    name: reviewData.name,
                    rating: reviewData.rating,
                    text: reviewData.text,
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error submitting review:', error);
        throw new Error('Failed to submit review');
    }
};

export const getReviews = async () => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        throw new Error('Failed to fetch reviews');
    }
};
