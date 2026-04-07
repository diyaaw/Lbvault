const Report = require('../models/Report');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const ReportBiomarker = require('../models/ReportBiomarker');
const ReportAiAnalysis = require('../models/ReportAiAnalysis');
const ReportAccess = require('../models/ReportAccess');
const aiService = require('../services/aiService');
const ttsService = require('../services/ttsService');

exports.uploadReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const { patientId, patientLvId, reportName, testType } = req.body;
        
        let patient;
        // If a pathology is uploading, they must supply the patient identifier
        if (req.user.role === 'pathology') {
            if (patientId) {
                patient = await User.findOne({ _id: patientId, role: 'patient' });
            } else if (patientLvId) {
                patient = await User.findOne({ lvId: patientLvId, role: 'patient' });
            }
        } else {
            // Otherwise, it is a patient uploading their own file
            patient = await User.findById(req.user.id);
        }

        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const fileUrl = `/uploads/reports/${req.file.filename}`;

        // 1. Create Core Report
        const report = new Report({
            patientId: patient._id,
            lvId: patient.lvId,
            uploadedBy: req.user.id,
            uploadedByRole: req.user.role,
            pathologyId: req.user.role === 'pathology' ? req.user.id : null,
            reportName,
            testType,
            fileUrl,
        });

        await report.save();

        // Respond to the user immediately so they don't have to wait for the LLM
        res.status(201).json({ message: 'Report uploaded! Processing in background.', report });

        // --- Asynchronous AI Pipeline --- //
        // Call Unified Native Gemini Pipeline
        const path = require('path');
        const fs = require('fs');
        
        let extractedText = "Raw extracted text for " + reportName;
        let aiBiomarkers = [];
        
        try {
            const absoluteFilePath = path.join(__dirname, '..', report.fileUrl.lstrip ? report.fileUrl.lstrip('/') : report.fileUrl.replace(/^\//, ''));
            
            console.log(`[PIPELINE] Pushing document to Gemini: ${absoluteFilePath}`);
            if (fs.existsSync(absoluteFilePath)) {
                const geminiResult = await aiService.extractBiomarkersFromDocument(absoluteFilePath);
                
                if (geminiResult && geminiResult.rawOcrText) {
                    extractedText = geminiResult.rawOcrText;
                }
                if (geminiResult && Array.isArray(geminiResult.biomarkers)) {
                    aiBiomarkers = geminiResult.biomarkers;
                }
                console.log(`[PIPELINE] Gemini extracted ${aiBiomarkers.length} biomarkers natively.`);
            } else {
                console.error('[GEMINI ERROR] File not found locally:', absoluteFilePath);
            }
        } catch (visionErr) {
            console.error('[GEMINI FATAL] Could not parse document via Gemini:', visionErr.message);
        }

        // 3. Save extracted Biomarkers to NoSQL Relation
        for (const b of aiBiomarkers) {
            // Guard against hallucinated non-numbers
            const val = Number(b.value) || 0;
            const min = Number(b.min) || 0;
            const max = Number(b.max) || 0;
            
            await ReportBiomarker.create({
                reportId: report._id,
                patientId: patient._id,
                biomarkerName: String(b.name || 'Unknown').toLowerCase(),
                value: val,
                unit: String(b.unit || ''),
                referenceMin: min,
                referenceMax: max,
                isAbnormal: val < min || val > max,
                source: 'ai_extracted',
                testDate: report.createdAt
            });
        }

        // 4. Generate Clinical Summary & Create Analysis Record
        console.log(`[PIPELINE] Generating Clinical Observation...`);
        const clinicalSummary = await aiService.simplifyText(extractedText, 'en');
        
        await ReportAiAnalysis.create({
            reportId: report._id,
            ocrText: extractedText,
            summaryEn: clinicalSummary
        });

        // 5. Update Legacy Analytics
        let analytics = await Analytics.findOne({ patientId: patient._id });
        if (!analytics) {
            analytics = new Analytics({ patientId: patient._id, biomarkerHistory: [] });
        }
        
        if (aiBiomarkers.length > 0) {
            analytics.biomarkerHistory.push({
                date: report.createdAt,
                reportId: report._id,
                biomarkers: aiBiomarkers.reduce((acc, curr) => ({ ...acc, [curr.name || 'unknown']: curr.value }), {})
            });
            await analytics.save();
        }
        
        console.log(`[PIPELINE] Fully complete for Report ${report._id}`);
        // --------------------------------- //

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getReports = async (req, res) => {
    try {
        let query = { isDeleted: false };
        if (req.user.role === 'patient') {
            query.patientId = req.user.id;
        } else if (req.user.role === 'pathology') {
            query.pathologyId = req.user.id;
        } else if (req.user.role === 'doctor') {
            // Find reports this doctor has access to
            const access = await ReportAccess.find({ doctorId: req.user.id, status: 'approved' }).select('reportId');
            const reportIds = access.map(a => a.reportId);
            query._id = { $in: reportIds };
        } // admin sees all

        // Note: For full robustness, you might populate patientId and pathologyId 
        const reports = await Report.find(query)
            .sort({ reportDate: -1 })
            .populate('patientId', 'name lvId email')
            .populate('pathologyId', 'name lvId'); // name refers to labName via users table
            
        res.status(200).json(reports);
    } catch (error) {
        console.error('Get Reports Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('patientId', 'name lvId email')
            .lean(); // Return plain object so we can attach relational data
            
        if (!report) return res.status(404).json({ message: 'Report not found' });

        // Fetch associated relational data
        const biomarkers = await ReportBiomarker.find({ reportId: report._id });
        const aiAnalysis = await ReportAiAnalysis.findOne({ reportId: report._id });

        // Map back to legacy frontend format temporarily until frontend is fully migrated
        const responseData = {
            ...report,
            extractedData: biomarkers.reduce((acc, b) => ({ ...acc, [b.biomarkerName]: b.value }), {}),
            biomarkers: biomarkers, // Added so new Insights page can render range bars
            aiSummary: aiAnalysis?.summaryEn || null,
            voiceSummaryUrl: aiAnalysis?.audioUrls?.get('en') || null
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Get Report By Id Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getReportSummary = async (req, res) => {
    try {
        const analysis = await ReportAiAnalysis.findOne({ reportId: req.params.id });
        if (!analysis) return res.status(404).json({ message: 'Report analysis not found' });
        
        const language = req.query.lang || 'en';

        // Check if we need to generate it
        if (!analysis.summaryEn && language === 'en') {
            analysis.summaryEn = await aiService.simplifyText(analysis.ocrText, language);
            await analysis.save();
        } else if (language !== 'en' && !analysis.translations.has(language)) {
            const translation = await aiService.simplifyText(analysis.ocrText, language);
            analysis.translations.set(language, translation);
            await analysis.save();
        }
        
        const summary = language === 'en' ? analysis.summaryEn : analysis.translations.get(language);
        const voiceUrl = analysis.audioUrls?.get(language);

        res.status(200).json({ summary, voiceSummaryUrl: voiceUrl });
    } catch (error) {
        console.error('Summary Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.generateVoice = async (req, res) => {
    try {
        const { reportId, language, text } = req.body;
        
        let summaryText = text;
        const analysis = reportId ? await ReportAiAnalysis.findOne({ reportId }) : null;

        if (!summaryText && analysis) {
            summaryText = language === 'en' ? analysis.summaryEn : analysis.translations?.get(language);
            
            if (!summaryText) {
                // generate missing summary
                summaryText = await aiService.simplifyText(analysis.ocrText, language);
                if (language === 'en') analysis.summaryEn = summaryText;
                else analysis.translations.set(language, summaryText);
                await analysis.save();
            }
        }

        if (!summaryText) return res.status(400).json({ message: 'Text payload is required.' });

        const audioUrl = await ttsService.generateAndStoreAudio(summaryText, language);
        
        // Save back to DB
        if (analysis) {
            if (!analysis.audioUrls) analysis.audioUrls = new Map();
            analysis.audioUrls.set(language, audioUrl);
            await analysis.save();
        }

        res.status(200).json({ audioUrl });
    } catch (error) {
        console.error('Voice Generation Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.grantAccess = async (req, res) => {
    try {
        const { reportId, doctorId } = req.body;
        
        const report = await Report.findOne({ _id: reportId, patientId: req.user.id });
        if (!report) return res.status(404).json({ message: 'Report not found' });

        await ReportAccess.findOneAndUpdate(
            { reportId, doctorId },
            { patientId: req.user.id, status: 'approved' },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: 'Access granted successfully' });
    } catch (error) {
        console.error('Grant Access Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
