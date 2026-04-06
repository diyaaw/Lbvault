const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        const token = req.header('Authorization');
        
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access Denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'fallback_secret');
            req.user = decoded;
            
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
            }
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token.' });
        }
    };
};

module.exports = authMiddleware;
