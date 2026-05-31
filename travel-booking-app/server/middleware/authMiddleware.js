const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    // ناخدو header
    const authHeader = req.headers.authorization;

    // خاص يكون Bearer TOKEN
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    // نحيدو Bearer
    const token = authHeader.split(" ")[1];

    // نتحققو من token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // نخزنو user info
    req.user = decoded;

    // نكملو للcontroller
    next();

  } catch (error) {
    res.status(401).json({
      message: "Invalid token"
    });
  }
};

module.exports = protect;