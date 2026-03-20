import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

//helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

//POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    //step 1: get date from request body
    const { name, email, password } = req.body;

    //step 2: validate data
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    //step 3: check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    //step 4: hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //step 5: create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    //step 6: generate JWT token
    const token = generateToken(user.id);

    //step 7: trả về response thành công
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    //transform error to global error handler in app.js
    next(error);
  }
};

//POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    //step 1: get data from request body
    const { email, password } = req.body;

    //step 2: validate data
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    //step3: find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    //step 4 check if user exists and password is correct
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    //step 5: generate JWT token
    const token = generateToken(user.id);

    //step 6: rreturn success response
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    //transform error to global error handler in app.js
    next(error);
  }
};

//GET /api/auth/me - get current user info
export const getMe = async (req, res, next) => {
    try {
        //req.user is set in auth.middleware.js after verifying JWT token
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        next(error);
    }
};