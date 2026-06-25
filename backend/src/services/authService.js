const User = require('../models/User');

class AuthService {
  async register(data) {
    const user = await User.create(data);
    return user;
  }
  
  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return null;
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return null;
    return user;
  }
}
module.exports = new AuthService();
