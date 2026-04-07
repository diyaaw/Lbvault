const Report = require('../models/Report');
const User = require('../models/User');

exports.getPathologyAnalytics = async (req, res) => {
    try {
        // Assume user is pathology
        const pathologyId = req.user.id;

        const totalReports = await Report.countDocuments({ uploadedBy: pathologyId });
        const uniquePatients = await Report.distinct('patientId', { uploadedBy: pathologyId });
        const totalPatients = uniquePatients.length;

        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        const uploadedToday = await Report.countDocuments({ uploadedBy: pathologyId, createdAt: { $gte: startOfDay } });

        const recentReports = await Report.find({ uploadedBy: pathologyId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('patientId', 'name');
        
        const recentUploads = recentReports.map(r => ({
            reportId: r._id,
            patientName: r.patientId ? r.patientId.name : 'Unknown',
            testType: r.testType || r.category || 'General',
            uploadDate: r.createdAt,
            fileUrl: r.fileUrl
        }));

        res.status(200).json({
            uploadedToday,
            reportTrend: "+12%", 
            totalPatients,
            patientTrend: "+5%",
            totalReports,
            systemStatus: "Active",
            uptime: "100%",
            recentUploads
        });
    } catch (error) {
        console.error('Dashboard Analytics Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
