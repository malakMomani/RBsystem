'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const users = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, required: true },
  birthDate: { type: Date, required: true }, 
  role: { type: String, required: true, default: 'student', enum: ['student', 'instructor'] },

});

// Adds a virtual field to the schema. We can see it, but it never persists
// So, on every user object ... this.token is now readable!
users.virtual('token').get(function () {
  let tokenObject = {
    email: this.email,
    exp: Math.floor(Date.now() / 1000) + (15 * 60)
  }
  let a = jwt.sign(tokenObject, process.env.SECRET);
  console.log('in vertual token ----------', a);
  return a;
});

users.pre('save', async function () {
  console.log('pre save this.isModified----------', this.isModified('password'));
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// BASIC AUTH
users.statics.authenticateBasic = async function (email, password) {
  const user = await this.findOne({ email })
  console.log( '--------authenticateBasic --------', user);
  const valid = await bcrypt.compare(password, user.password)
  if (valid) { return user; }
  throw new Error('Invalid User');
}

// BEARER AUTH
users.statics.authenticateWithToken = async function (token) {
  try {
    const parsedToken = jwt.verify(token, process.env.SECRET);
    const user = await this.findOne({ email: parsedToken.email })
    console.log( '--------authenticateWithToken parsedToken--------', parsedToken);
    console.log( '--------authenticateWithToken user--------', user);
    if (user) { return user; }
    throw new Error("User Not Found");
  } catch (e) {
    throw new Error(e.message)
  }
}

users.virtual('capabilities').get(function () {
  let acl = {
    student: ['enroll'],
    instructor: ['enroll' , 'create']
  };
  return acl[this.role];
});



module.exports = mongoose.model('users', users);