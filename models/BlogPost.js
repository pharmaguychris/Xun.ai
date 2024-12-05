const mongoose = require('mongoose');
const Joi = require('joi');

const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    content: {
        type: String,
        required: true,
        minlength: 50
    },
    excerpt: {
        type: String,
        required: true,
        maxlength: 500
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    publishedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    featuredImage: {
        url: String,
        alt: String
    }
}, {
    timestamps: true
});

// Create URL-friendly slug from title
blogPostSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

// Input validation schema
const validateBlogPost = (blogPost) => {
    const schema = Joi.object({
        title: Joi.string().min(5).max(200).required(),
        content: Joi.string().min(50).required(),
        excerpt: Joi.string().max(500).required(),
        tags: Joi.array().items(Joi.string()),
        status: Joi.string().valid('draft', 'published'),
        featuredImage: Joi.object({
            url: Joi.string().uri(),
            alt: Joi.string()
        })
    });
    return schema.validate(blogPost);
};

module.exports = {
    BlogPost: mongoose.model('BlogPost', blogPostSchema),
    validateBlogPost
};
