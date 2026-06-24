const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(400).json({
      error: "No authorization",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Unauthorized user, please check credentials",
    });
  }
};

const requireAdmin = (req, res, next) => {
  const role = req.user.role;
  if (role != "admin") {
    return res.status(403).json({
      error: "User is unauthorized",
    });
  }
  next();
};

module.exports = { authMiddleware, requireAdmin };
