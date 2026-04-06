const User = require('../models/User');
const Report = require('../models/Report');

exports.grantAccess = async (req, res) => {
    try {
        const { doctorId, reportId } = req.body;
        
        // If reportId is provided, grant access to specific report
        if (reportId) {
            const report = await Report.findOne({ _id: reportId, patientId: req.user.id });
            if (!report) return res.status(404).json({ message: 'Report not found' });

            if (!report.doctorAccess.includes(doctorId)) {
                report.doctorAccess.push(doctorId);
                await report.save();
            }
        } 
        
        res.status(200).json({ message: 'Access granted successfully' });
    } catch (error) {
        console.error('Grant Access Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.revokeAccess = async (req, res) => {
    try {
        const { doctorId, reportId } = req.body;
        
        if (reportId) {
            const report = await Report.findOne({ _id: reportId, patientId: req.user.id });
            if (!report) return res.status(404).json({ message: 'Report not found' });

            report.doctorAccess = report.doctorAccess.filter(id => id.toString() !== doctorId);
            await report.save();
        }
        
        res.status(200).json({ message: 'Access revoked successfully' });
    } catch (error) {
        console.error('Revoke Access Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAccessList = async (req, res) => {
    try {
        // Find all reports for this patient that have doctorAccess populated
        const reports = await Report.find({ patientId: req.user.id, 'doctorAccess.0': { $exists: true } });
        
        // Collect unique doctor IDs currently accessing this patient's reports
        const doctorIds = new Set();
        reports.forEach(report => {
            report.doctorAccess.forEach(docId => doctorIds.add(docId.toString()));
        });
        
        const doctors = await User.find({ _id: { $in: Array.from(doctorIds) }, role: 'doctor' }).select('name email role');
        
        // Format response expected by the frontend
        const formattedList = doctors.map(doc => ({
            id: doc._id,
            name: doc.name,
            specialty: 'Doctor', // Placeholder for now
            status: 'active'
        }));
        
        res.status(200).json(formattedList);
    } catch (error) {
        console.error('Get Access List Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
