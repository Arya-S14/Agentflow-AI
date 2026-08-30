const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

// In-memory user database fallback
const inMemoryUsers = new Map();

const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email }).catch(() => null);
  if (existingUser || inMemoryUsers.has(email)) {
    const error = new Error('User with this email already exists');
    error.statusCode = 400;
    throw error;
  }

  try {
    const user = new User({ name, email, password, role: role || 'operator' });
    await user.save();
    const token = signToken(user);
    return { user: formatUser(user), token };
  } catch (err) {
    // Fallback to in-memory store if DB error
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);
    const mockUser = {
      _id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      email,
      password: hashedPassword,
      role: role || 'operator',
      createdAt: new Date(),
    };
    inMemoryUsers.set(email, mockUser);
    const token = signToken(mockUser);
    return { user: formatUser(mockUser), token };
  }
};

const loginUser = async ({ email, password }) => {
  let user = await User.findOne({ email }).select('+password').catch(() => null);

  if (!user && inMemoryUsers.has(email)) {
    user = inMemoryUsers.get(email);
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }
    const token = signToken(user);
    return { user: formatUser(user), token };
  }

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  user.lastLogin = new Date();
  await user.save().catch(() => {});

  const token = signToken(user);
  return { user: formatUser(user), token };
};

const getUserProfile = async (userId) => {
  let user = await User.findById(userId).catch(() => null);
  if (!user) {
    for (const u of inMemoryUsers.values()) {
      if (u._id === userId) {
        user = u;
        break;
      }
    }
  }

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return formatUser(user);
};

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const formatUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    lastLogin: user.lastLogin || new Date(),
  };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  signToken,
};
