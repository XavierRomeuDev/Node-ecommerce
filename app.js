const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const helpers = require('./helpers');
const errorHandlers = require('./handlers/errorHandlers');
const passport = require('passport');
const router = require('./routes/router');
require('./handlers/passport');

//Creació de l'app en EXPRESS
const app = express();

//Servim de forma estatica els fitxers desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

//Indiquem la carpeta on tindrem les views de l'app, amb la tecnologia PUG
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Body-parser de EXPRESS
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use(session({
    secret: process.env.SECRET,
    key: process.env.KEY, //name of the cookie
    resave: false,
    saveUninitialized: false,
    //the session is stored in the DB
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE
    })
}));

// Passport JS is what we use to handle our logins
app.use(passport.initialize())
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.h = helpers;
    res.locals.flashes = req.flash();
    res.locals.currentPath = req.path;
    res.locals.user = req.user || null; 
    next(); //Go to the next middleware in the REQ-RES CYCLE
});

//Soportem cada crida a / amb el modul routes
app.use('/', router);

app.use(errorHandlers.notFound);
//if errors are just BD validation errors -> show them in flashes
app.use(errorHandlers.flashValidationErrors);
// Otherwise this was a really bad error we didn't expect!
if (app.get('env') === 'development') {
 /* Development Error Handler - Prints stack trace */
 app.use(errorHandlers.developmentErrors);
}
/* production error handler */
app.use(errorHandlers.productionErrors);

module.exports = app;