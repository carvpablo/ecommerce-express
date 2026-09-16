import jwt from "jsonwebtoken";
import "dotenv/config";

export const validateToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  let token;

  if (req.cookies?.jwtToken) {
    token = req.cookies.jwtToken;
  } else if (authorization && authorization.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(500).json({ error: "Invalid or expired token" });
  }
};
