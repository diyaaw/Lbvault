const Report = require('../models/Report');
const User = require('../models/User');
const Analytics = require('../models/Analytics');

exports.uploadReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const { patientLvId, reportName, testType } = req.body;
        
        let patient;
        // If a pathology is uploading, they must supply the patientLvId
        if (req.user.role === 'pathology') {
            patient = await User.findOne({ lvId: patientLvId, role: 'patient' });
        } else {
            // Otherwise, it is a patient uploading their own file
            patient = await User.findById(req.user.id);
        }

        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const fileUrl = `/uploads/${req.file.filename}`;

        const report = new Report({
            patientId: patient._id,
            pathologyId: req.user.role === 'pathology' ? req.user.id : null,
            lvId: patient.lvId,
            reportName,
            testType,
            fileUrl,
        });

        await report.save();

        // Simulate Python OCR parsing to extract biomarkers. In real app, make axios call to python OCR service
        // const ocrRes = await axios.post('http://localhost:5001/ocr/process', { fileUrl });
        const dummyBiomarkers = { glucose: 105, hemoglobin: 14.2, cholesterol: 180 };
        
        report.biomarkers = dummyBiomarkers;
        await report.save();

        // Update analytics
        let analytics = await Analytics.findOne({ patientId: patient._id });
        if (!analytics) {
            analytics = new Analytics({ patientId: patient._id, biomarkerHistory: [] });
        }
        
        analytics.biomarkerHistory.push({
            date: report.uploadDate,
            reportId: report._id,
            biomarkers: report.biomarkers
        });
        await analytics.save();

        res.status(201).json({ message: 'Report uploaded successfully', report });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getReports = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'patient') {
            query.patientId = req.user.id;
        } else if (req.user.role === 'doctor') {
            query.doctorAccess = req.user.id;
        } else if (req.user.role === 'pathology') {
            query.pathologyId = req.user.id;
        } // admin sees all

        const reports = await Report.find(query).sort({ uploadDate: -1 }).populate('patientId', 'name lvId');
        res.status(200).json(reports);
    } catch (error) {
        console.error('Get Reports Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const aiService = require('../services/aiService');

exports.getReportSummary = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        
        const language = req.query.lang || 'en';

        // Dynamically fetch translation for the required language every time to allow seamless swapping in tests
        const rawText = report.ocrText || `Patient Biomarkers: ${JSON.stringify(report.biomarkers)}`;
        report.aiSummary = await aiService.simplifyText(rawText, language);
        
        await report.save();
        res.status(200).json({ summary: report.aiSummary, voiceSummaryUrl: report.voiceSummaryUrl });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const ttsService = require('../services/ttsService');

exports.generateVoice = async (req, res) => {
    try {
        const { reportId, language, text } = req.body;
        
        // Handle robust input sourcing: either from straight payload or from DB
        let summaryText = text;
        if (!summaryText && reportId) {
            const report = await Report.findById(reportId);
            if (!report) return res.status(404).json({ message: 'Report not found' });
            
            // Generate the text directly matching the requested TTS language to prevent English cache conflicts
            const rawText = report.ocrText || `Patient Biomarkers: ${JSON.stringify(report.biomarkers)}`;
            summaryText = await aiService.simplifyText(rawText, language);
        }

        if (!summaryText) return res.status(400).json({ message: 'Text payload is required.' });

        const audioUrl = await ttsService.generateAndStoreAudio(summaryText, language);
        
        // Explicitly format as JSON matching POST /ai/audio instructions
        res.status(200).json({ audioUrl });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.grantAccess = async (req, res) => {
    try {
        const { reportId, doctorId } = req.body;
        
        const report = await Report.findOne({ _id: reportId, patientId: req.user.id });
        if (!report) return res.status(404).json({ message: 'Report not found' });

        if (!report.doctorAccess.includes(doctorId)) {
            report.doctorAccess.push(doctorId);
            await report.save();
        }

        res.status(200).json({ message: 'Access granted successfully', report });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
