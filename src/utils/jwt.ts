import jwt, { SignOptions } from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  email: string;
  role: "passenger" | "driver" | "admin";
  iat?: number;
  exp?: number;
}

export interface TokenOptions {
  expiresIn?: string;
}

export const generateToken = (
  payload: Omit<JwtPayload, "iat" | "exp">,
  options?: TokenOptions
): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const defaultOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  };

  const tokenOptions = { ...defaultOptions, ...options };

  try {
    const token = jwt.sign(payload, secret, tokenOptions as SignOptions);
    return token;
  } catch (error) {
    throw new Error(`Error generating token: ${error}`);
  }
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded.userId || !decoded.email || !decoded.role) {
      throw new Error("Invalid token: missing required data");
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }

    if (error instanceof jwt.NotBeforeError) {
      throw new Error("Token not valid yet");
    }

    throw new Error(`Error verifying token: ${error}`);
  }
};
