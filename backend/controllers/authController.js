const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const generateLvId = require('../utils/generateLvId');
const PatientProfile = require('../models/PatientProfile');
const PathologyProfile = require('../models/PathologyProfile');
const DoctorProfile = require('../models/DoctorProfile');

exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate LV-ID
        const lvId = await generateLvId();

        user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            lvId
        });

        await user.save();

        // Establish the relational 1:1 profile
        if (role === 'patient') {
            await PatientProfile.create({ userId: user._id });
        } else if (role === 'pathology') {
            await PathologyProfile.create({ 
                userId: user._id, 
                labName: name, 
                licenseNumber: `PENDING-${Date.now()}` 
            });
        } else if (role === 'doctor') {
            await DoctorProfile.create({ 
                userId: user._id, 
                registrationNumber: `PENDING-${Date.now()}` 
            });
        }

        const token = jwt.sign({ id: user._id, role: user.role, lvId: user.lvId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

        res.status(201).json({ token, user: { _id: user._id, name, email, role, lvId } });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role, lvId: user.lvId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

        res.status(200).json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, lvId: user.lvId } });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
