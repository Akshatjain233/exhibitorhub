const authService = require('../services/authService');
const jwt = require('jsonwebtoken');
const { successResponse, errorResponse } = require('../utils/response');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    const token = generateToken(user._id);
    return successResponse(res, 201, 'User registered successfully', { token, role: user.role, email: user.email, id: user.id });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    if (!user) return errorResponse(res, 401, 'Invalid credentials');
    
    const token = generateToken(user._id);
    return successResponse(res, 200, 'Login successful', { token, role: user.role, email: user.email, id: user.id });
  } catch (error) { next(error); }
};

exports.getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'Current user retrieved', req.user);
  } catch (error) { next(error); }
};
