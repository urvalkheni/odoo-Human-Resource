import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'hr') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin/HR only.' });
  }
  next();
};
