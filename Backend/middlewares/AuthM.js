const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided or it is missing, access denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;

        const expirationTime = decoded.exp * 1000; 
        const currentTime = Date.now();

        if (expirationTime - currentTime <= 5 * 60 * 1000) { 
            const newToken = jwt.sign(
                { userId: decoded.userId, role: decoded.role }, 
                process.env.JWT_SECRET,
                { expiresIn: '5h' }
            );
            res.setHeader('X-New-Token', newToken); 
        }

        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;