// The function verifyToken checks that a valid JWT was sent in the Authorization header.
// On success, attaches the decoded payload (id, role, name) to req.user.

const jwt = require("jsonwebtoken");
function verifyToken(req, res, next) {
  const header = req.headers.authorization; // expected format: "Bearer <token>"
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, name, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Factory: requireRole("admin") or requireRole("admin", "advisor")
// IMPORTANT: this is the server-side check the brief requires.
// Hiding a button in React is NOT access control - this middleware is.
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };