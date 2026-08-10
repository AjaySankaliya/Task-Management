import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

const getGoogleAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

const exchangeGoogleCode = async (code: string) => {
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to exchange Google authorization code");
  }

  const tokenPayload = (await tokenResponse.json()) as {
    access_token?: string;
  };

  if (!tokenPayload.access_token) {
    throw new Error("Google token response did not include an access token");
  }

  const profileResponse = await fetch(
    `${GOOGLE_USERINFO_URL}?access_token=${encodeURIComponent(tokenPayload.access_token)}`
  );

  if (!profileResponse.ok) {
    throw new Error("Failed to fetch Google user profile");
  }

  return (await profileResponse.json()) as {
    id: string;
    email: string;
    name?: string;
    given_name?: string;
    picture?: string;
  };
};

const issueTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const { accessToken, refreshToken } = issueTokens(user._id.toString());

    res.status(200).json({
      success: true,
      message: "Login Successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = (req: Request, res: Response) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    return res.status(500).json({
      success: false,
      message: "Google OAuth is not configured",
    });
  }

  return res.redirect(getGoogleAuthUrl());
};

export const googleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawCode = req.query.code;
    const code =
      typeof rawCode === "string"
        ? rawCode
        : Array.isArray(rawCode) && typeof rawCode[0] === "string"
          ? rawCode[0]
          : undefined;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Google authorization code is missing",
      });
    }

    const profile = await exchangeGoogleCode(code);
    const email = profile.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account email is required",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: profile.name || profile.given_name || email.split("@")[0],
        email,
        googleId: profile.id,
        authProvider: "google",
      });
    } else {
      const updates: Record<string, string> = {};

      if (!user.googleId) updates.googleId = profile.id;
      if (!user.authProvider || user.authProvider !== "google") updates.authProvider = "google";
      if (!user.name && profile.name) updates.name = profile.name;

      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, updates);
      }
    }

    const { accessToken, refreshToken } = issueTokens(user._id.toString());
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const redirectUrl = new URL("/auth/google/callback", frontendUrl);

    redirectUrl.searchParams.set("accessToken", accessToken);
    redirectUrl.searchParams.set("refreshToken", refreshToken);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh Token Required",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { userId: string };

    const accessToken = jwt.sign(
      {
        userId: decoded.userId,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find().select("name email");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
