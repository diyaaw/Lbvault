const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pathologyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lvId: { type: String, required: true },
    reportName: { type: String, required: true },
    testType: { type: String, required: true },
    fileUrl: { type: String, required: true },
    ocrText: { type: String, default: '' },
    aiSummary: { type: String, default: '' },
    voiceSummaryUrl: { type: String, default: '' },
    doctorComment: { type: String, default: '' },
    biomarkers: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    doctorAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    uploadDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
