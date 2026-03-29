const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

module.exports = { generateToken };
