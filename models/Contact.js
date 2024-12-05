const mongoose = require('mongoose');
const Joi = require('joi');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    message: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['new', 'read', 'responded'],
        default: 'new'
    },
    ipAddress: String,
    userAgent: String
});

// Input validation schema
const validateContact = (contact) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        message: Joi.string().min(10).max(1000).required()
    });
    return schema.validate(contact);
};

module.exports = {
    Contact: mongoose.model('Contact', contactSchema),
    validateContact
};
