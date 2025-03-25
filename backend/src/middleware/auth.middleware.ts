import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


//JWT middelware to check in subsequet requets
interface AuthRequest extends Request {
  user?: {
    id: string;
    fireflyKey: string;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "test_secret_rc") as {
      id: string;
      fireflyKey: string;
    };

    req.user = {
      id: decoded.id,
      fireflyKey: decoded.fireflyKey
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
