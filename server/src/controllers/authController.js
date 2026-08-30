const authService = require('../services/authService');
const { validationResult } = require('express-validator');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;
    const result = await authService.registerUser({ name, email, password, role });

    return res.status(201).json({
      message: 'User registered successfully',
      ...result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    return res.status(200).json({
      message: 'Login successful',
      ...result,
    });
  } catch (error) {
    return res.status(error.statusCode || 401).json({ error: error.message });
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
