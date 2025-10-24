const jwt = require('jsonwebtoken');
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDB();
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!user) {
      return res.status(401).json({ message: 'Token invalid. User not found.' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;