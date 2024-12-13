import jwt from "jsonwebtoken";

export const verifyUser = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; // Assuming you store token in cookies

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decoding the token
    req.user = decoded; // Attach user data to the request
    next(); // Proceed to the next middleware
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
