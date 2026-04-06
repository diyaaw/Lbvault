const Analytics = require('../models/Analytics');

exports.getAnalytics = async (req, res) => {
    try {
        const { patientId } = req.params;
        
        // Basic Security check
        if (req.user.role === 'patient' && req.user.id !== patientId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const analytics = await Analytics.findOne({ patientId }).populate('patientId', 'name lvId');
        if (!analytics) {
            return res.status(404).json({ message: 'No analytics found for this patient' });
        }

        res.status(200).json(analytics);
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
