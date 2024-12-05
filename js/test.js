import { supabase } from './supabase-config.js';

// Test runner
async function runTests() {
    const testResults = document.getElementById('testResults');
    testResults.innerHTML = '🏃 Starting Supabase Integration Tests...\n\n';
    
    try {
        // Test connection to Supabase
        testResults.innerHTML += '🔌 Testing Supabase Connection...\n';
        const { data: connectionTest, error: connectionError } = await supabase.from('contact_submissions').select('count').limit(1);
        if (connectionError) {
            console.error('Connection error details:', connectionError);
            throw new Error(`Connection failed: ${connectionError.message}`);
        }
        testResults.innerHTML += '✅ Connected to Supabase successfully\n\n';

        // Test contact form
        testResults.innerHTML += '📝 Testing Contact Form Submission...\n';
        const contactResult = await testContactSubmission();
        testResults.innerHTML += `✅ Contact Form Test: ${contactResult}\n\n`;

        // Test reviews
        testResults.innerHTML += '⭐ Testing Review System...\n';
        const reviewResult = await testReviewSystem();
        testResults.innerHTML += `✅ Review System Test: ${reviewResult}\n\n`;

        // Test blog posts
        testResults.innerHTML += '📚 Testing Blog System...\n';
        const blogResult = await testBlogSystem();
        testResults.innerHTML += `✅ Blog System Test: ${blogResult}\n\n`;

        testResults.innerHTML += '🎉 All tests completed successfully!';
    } catch (error) {
        console.error('Full error details:', error);
        testResults.innerHTML += `\n❌ Test Failed: ${error.message}\n`;
        if (error.details) testResults.innerHTML += `Details: ${error.details}\n`;
        if (error.hint) testResults.innerHTML += `Hint: ${error.hint}\n`;
        console.error('Test error:', error);
    }
}

// Test contact form submission
async function testContactSubmission() {
    const testContact = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test contact submission'
    };

    console.log('Attempting to submit contact:', testContact);
    const { data, error } = await supabase
        .from('contact_submissions')
        .insert([testContact])
        .select();

    if (error) {
        console.error('Contact submission error details:', error);
        throw new Error(`Contact submission failed: ${error.message}`);
    }
    return `Successfully submitted contact form (ID: ${data[0].id})`;
}

// Test review system
async function testReviewSystem() {
    // Insert test review
    const testReview = {
        name: 'Test Reviewer',
        rating: 5,
        text: 'This is a test review - the service was excellent!'
    };

    console.log('Attempting to submit review:', testReview);
    const { data: insertData, error: insertError } = await supabase
        .from('reviews')
        .insert([testReview])
        .select();

    if (insertError) {
        console.error('Review submission error details:', insertError);
        throw new Error(`Review submission failed: ${insertError.message}`);
    }

    // Fetch reviews to verify
    const { data: reviews, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (fetchError) {
        console.error('Review fetch error details:', fetchError);
        throw new Error(`Review fetch failed: ${fetchError.message}`);
    }
    
    return `Successfully submitted review (ID: ${insertData[0].id}) and retrieved ${reviews.length} reviews`;
}

// Test blog system
async function testBlogSystem() {
    // Insert test blog post
    const testPost = {
        title: 'Test Blog Post',
        slug: 'test-blog-post-' + Date.now(),
        content: 'This is a test blog post content.',
        excerpt: 'Test blog post excerpt',
        status: 'published'
    };

    console.log('Attempting to create blog post:', testPost);
    const { data: insertData, error: insertError } = await supabase
        .from('blog_posts')
        .insert([testPost])
        .select();

    if (insertError) {
        console.error('Blog post creation error details:', insertError);
        throw new Error(`Blog post creation failed: ${insertError.message}`);
    }

    // Fetch published posts to verify
    const { data: posts, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1);

    if (fetchError) {
        console.error('Blog post fetch error details:', fetchError);
        throw new Error(`Blog post fetch failed: ${fetchError.message}`);
    }
    
    return `Successfully created blog post (ID: ${insertData[0].id}) and retrieved ${posts.length} posts`;
}

// Run the tests when the page loads
document.addEventListener('DOMContentLoaded', runTests);
