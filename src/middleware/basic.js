'use strict';

const base64 = require('base-64');
const User = require('../model/users-model.js');

module.exports = async (req, res, next) => {

  if (!req.headers.authorization) { return _authError(); }
  console.log('---basic handler ---', req.headers.authorization);
  let basic = req.headers.authorization.split(' ').pop();
  let [email, pass] = base64.decode(basic).split(':');

  try {
    req.user = await User.authenticateBasic(email, pass)
    next();
  } catch (e) {
    res.status(403).send('Invalid Login');
  }

}