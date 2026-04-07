const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    lvId: { type: String, unique: true, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, sparse: true },
    password: { type: String, required: true }, // Equivalent to passwordHash
    role: { type: String, enum: ['patient', 'pathology', 'doctor', 'admin'], required: true },
    name: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
