

const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
        const token = authorizationHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            } else {
                req.userData = decoded;
                next();
            }
        });
    } else {
        return res.status(401).json({ message: 'Authorization token is missing or invalid' });
    }
}
    
    


module.exports = verifyToken;
