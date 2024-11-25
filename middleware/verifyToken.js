const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: "Access Denied, No token Provided" });
    }

    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: "Access Denied, No token Provided" });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token' });
            } else {
                return res.status(500).json({ message: 'Token verification failed', err });
            }
        }
        req.userId = decoded.id;
        next();
    });
};

module.exports = verifyToken;
