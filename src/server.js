'use strict';
const passport = require('passport')
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const User = require('./model/users-model');
const path = require('path');
const acl = require('../src/middleware/acl.js');
// const notFoundHandler = require('./middleware/404');
// const errorHandler = require('./middleware/500');
// const routs = require('./auth/router')
const basicAuth = require('./middleware/basic')
const bearerAuth = require('./middleware/bearer')
const cookieSession = require('cookie-session')
require('./passport')
app.use(cors());
app.use(morgan('dev'));
// Process JSON input and put the data on req.body
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieSession({
    name: 'ishaqSession',
    keys: ['btata1', 'btata2']
  }))
// Process FORM intput and put the data on req.body
app.use(express.urlencoded({ extended: true }));
// app.use(routs)

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})
app
.set('Content-Type:', 'application/x-www-form-urlencoded')
.post('/signup', async (req, res) => {
    console.log('Body--------->', req.body);
    let user = new User(req.body);
    const userRecord = await user.save();
    const output = {
      user: userRecord,
      token: userRecord.token
    };
    res.sendFile(path.join(__dirname+'/create_course.html'));
})
// app.get('/oauth/google', (req,res) => {
//     res.send()
// })

app.post('/signin', basicAuth, (req, res, next) => {
    console.log('---signin---',req.body);
    console.log('---signin---',req.user);
    const user = {
      user: req.user,
      token: req.user.token
    };
    res.status(200).json(user);
  });
  
  app.get('/users', bearerAuth, async (req, res, next) => {
    const users = await User.find({});
    const list = users.map(user => user.email);
    res.status(200).json(list);
  });
  
  app.get('/secret', bearerAuth, async (req, res, next) => {
    res.status(200).send("Welcome to the secret area!")
  });

  app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}));

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['public_profile', 'email'] }
));

app.get( '/auth/facebook/callback',
    passport.authenticate( 'facebook', {
        successRedirect: '/auth/facebook/success',
        failureRedirect: '/auth/facebook/failure'
}));
app.get( '/auth/facebook/success', (req, res) => {
    console.log('inside -----------------------------/auth/facebook/callback',req.body);
    res.send('facebook sucess');
});
app.get('/auth/facebook/failure', (req,res) => {
    res.send('failed login')
})
app.get('/auth/google/failure', (req,res) => {
    res.send('failed login')
})
app.get('/auth/google/success', (req,res) => {
    console.log(' in /auth/google/success route--------------',req.body);
    res.send('Google sucess');
    

})

app.post("/create-course" , bearerAuth, acl('create'), async (req, res , next) => {

  console.log('post req ' , req.body.user);
  const users = await User.find({});
  const list = users.map(user => user.username);
  res.status(200).json(list);
});

function start(){

const PORT = process.env.PORT;
    app.listen(PORT, () => {
        console.log(`I'm in port ${PORT}`)
    })
}

function nextPage(){

}
// app.use('*', notFoundHandler);
// app.use(errorHandler);
module.exports = {
    app,
    start
}