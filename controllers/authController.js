const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const mail = require('../handlers/mail');
const passport = require('passport');

exports.login = (req, res) => {
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: 'Failed Login'
    })(req, res, function() {
        req.flash('success', 'You are now logged in');
        res.redirect('/products');
    });
};

exports.loginForm = (req, res) => {
    res.render('login', { title: 'Login'});
};

exports.logout = (req, res) => {
    req.logout(function(err) {
        if (err) {
            next(err);
            return;
        }
        req.flash('success', 'You are now logged out');
        res.redirect('/products');
    });
};

//MIDDLEWARE FUNCTION: verify whether the user is logged in
exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next(); //carry on!
        return;
    }
    req.flash('error', 'you must be logged in to do that');
    res.redirect('/login');
};

exports.forgot = async (req, res) => {
    //1. see if a user with that email exists
    const user = await User.findOne({ email: req.body.email});
    if (!user) {
        req.flash('error', 'No account with that email exists');
        res.redirect('/login');
        return;
    }
   
    //2. set reset tokens and expiry on that account
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000; //1 hour from now
    await user.save(); //store both fields in the database.
   
    //3. send him an email with the token
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    
    await mail.send({
        user: user,
        subject: 'Password Reset',
        resetURL: resetURL
    });

    req.flash('success', 'You have been emailed a password reset link.');
    
    //4. redirect to login page
    res.redirect('/login');
};

exports.reset = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if(!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        res.redirect('/login');
        return;
    }

    res.render('reset', { title: 'Reset your password'});
};

exports.confirmedPasswords = (req, res, next) => {
    //We cannot do req.body.password-confirm because of “-“
    //We access as an Array instead
    if (req.body.password === req.body['password-confirm']) {
        next(); //keep going
        return;
    }
    
    req.flash('error', 'Passwords do not match');
    res.redirect('back');
};

exports.updatePassword = async (req, res) => {
    const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
    });

    if(!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        res.redirect('/login');
        return;
    }

    await user.setPassword(req.body.password);
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    
    await new Promise(function(res, rej) {
        req.login(updatedUser, function(err, data) {
            if (err) rej(err);
                else res(data);
        });
    });
    
    req.flash('success', 'Your password has been reset. You are now logged in');
    res.redirect('/products');
};