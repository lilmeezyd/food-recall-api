const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const fs = require("fs")
const path = require("path")

//@desc Register User
//@route POST /api/users
//@access Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, password2 } = req.body;
  if (!firstName || !lastName || !email || !password || !password2) {
    res.status(400);
    throw new Error("Please add all fields!");
  }

  // Check if passwords do match
  if (password !== password2) {
    res.status(400);
    throw new Error("Passwords do not match!");
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create User
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

//@desc Password reset request
//@route
//@access Public
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User does not exist");
  }

  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await Token.deleteOne();
  }

  let resetToken = crypto.randomBytes(32).toString("hex");
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(resetToken, salt);

  await Token.create({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  });

  const link = `localhost:8000/passwordReset?token=${resetToken}&id=${user._id}`;
  sendEmail(
    user.email,
    "Password Reset Request",
    { name: user.firstName, link: link },
    "./templates/requestReset.handlebars"
  );
  return link;
})

//@desc Password restting
//@access Public
const resetPassword = asyncHandler(async (req, res) => {
  const { userId, token, password } = req.body;
  let passwordResetToken = await Token.findOne({ userId });
  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }

  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if (!isValid) {
    throw new Error("Invalid or expired password reset token");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  await User.updateOne(
    { _id: userId },
    { $set: { password: hashedPassword } },
    { new: true }
  );
  const user = await User.findById({ _id: userId });
  sendEmail(
    user.email,
    "Password Reset Successfully",
    {
      name: user.name,
    },
    "./template/resetPassword.handlebars"
  );

  await passwordResetToken.deleteOne();
  return true;
});

//@desc Authenticate User
//@route POST /api/users/login
//@access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

//@desc Change Password
//@route POST /api/users/newPassword
//@access Private
const changePassword = asyncHandler(async (req, res) => {
  const {oldPassword, newPassword, confirmPassword} = req.body
  const user = await User.findById(req.user._id)
  const { password } = user
  if(!oldPassword || !newPassword || !confirmPassword) {
    res.status(400)
    throw new Error('Please enter all fields')
  }

  // Check if new passwords match
  if(newPassword !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match!");
  }

  // check if old and new passwords match
  if(user && (await bcrypt.compare(newPassword, password))) {
    res.status(400);
    throw new Error("New password can't match old password!")
  }
  if (user && (await bcrypt.compare(oldPassword, password))) {
    //hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    await User.updateOne(
      { _id: req.user._id },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    res.status(200).json({msg: 'password updated'})
  }
})

//@desc Get user data
//@route GET /api/users/me
//@access Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// Generate JWT
const generateToken = (id, roles) => {
  return jwt.sign({ id, roles }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  changePassword,
  getMe,
};
