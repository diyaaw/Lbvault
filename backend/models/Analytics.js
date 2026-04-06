const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    biomarkerHistory: [{
        date: { type: Date, required: true },
        reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
        biomarkers: { type: Map, of: Number }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
