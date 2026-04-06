const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor', 'pathology', 'admin'], default: 'patient' },
    lvId: { type: String, unique: true, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
