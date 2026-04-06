const User = require('../models/User');

exports.searchPatients = async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) return res.status(200).json([]);
        
        const patients = await User.find({
            role: 'patient',
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { lvId: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('-password');
        
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.registerPatient = async (req, res) => {
    try {
        // Simple passthrough to auth controller logic in a real monolithic set up
        // Currently relying on authController.signup or dedicated pathology-patient registration
        res.status(201).json({ message: 'Patient registered successfully (Stub)' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updatePatient = async (req, res) => {
    // Stub
    res.status(200).json({ message: 'Patient updated' });
};

exports.deletePatient = async (req, res) => {
    // Stub
    res.status(200).json({ message: 'Patient deleted' });
};
