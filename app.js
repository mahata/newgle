/**
 * Module dependencies.
 */

var express = require('express'),
    io = require('socket.io'),
    db = require('dirty')('log.db'),
    fs = require('fs'),
    pg = require('pg'),
    http = require('http'),
    crypto = require('crypto'),

    bing = require(__dirname + "/lib/bing"),
    yahoo = require(__dirname + "/lib/yahoo"),
    segmenter = require(__dirname + "/lib/segmenter"),
    util = require(__dirname + "/lib/util"),

    conString = 'postgres://' + process.env.PGSQL_USER + ':' + process.env.PGSQL_PASS + '@' + process.env.PGSQL_HOST + '/' + process.env.PGSQL_DB,
    app = module.exports = express.createServer();

// Configuration
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({secret: 'aa'}));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});
app.configure('development', function() {
    express.logger('development mode');
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function() {
    express.logger('production mode');
    app.use(express.errorHandler());
});

// Routes
app.get('/', function(req, res) {
    if (undefined !== req.param('q')) {
        res.redirect('/#q=' + req.param('q'));
    }

    res.render('search', {
        title: 'Newgle',
    });
});
app.get('/test', function(req, res) {
    var _segmenter = new segmenter.TinySegmenter();
    var segs = _segmenter.segment("私の名前は中野です");
    res.send(segs.join(" | "));
});
app.get('/login', function(req, res) {
    res.render('login', {
        title: 'Newgle - login'
    });
});
app.post('/login', function(req, res) {
    pg.connect(conString, function(err, client) {
        if (null !== client) {
            client.query('SELECT name FROM users WHERE name = $1 AND pass = $2',
                         [req.param('name'), util.getStretchedPassword(req.param('pass'),
                                                                       req.param('name'),
                                                                       process.env.STRETCH_TIMES)],
                         function(err, result) {
                             if (null !== err && req.param('name') === result.rows[0].name) {
                                 req.session.user = req.param('name');
                             }
                             console.log(err);
                             console.log(result);
                             res.render('login-done', {
                                 title: 'Newgle - login done',
                                 name: req.param('name'),
                                 result: result,
                                 err: err
                             });
                         });
        } else {
            res.send('Something went wrong...');
        }
    });
});
app.get('/signup', function(req, res) {
    res.render('signup', {
        title: 'Newgle - signup'
    });
});
app.post('/signup', function(req, res) {
    pg.connect(conString, function(err, client) {
        if (null !== client) {
            client.query('INSERT INTO users (name, pass) VALUES ($1, $2)',
                         [req.param('name'), util.getStretchedPassword(req.param('pass'),
                                                                       req.param('name'),
                                                                       process.env.STRETCH_TIMES)],
                         function(err, result) {
                             if (null === err) { req.session.user = req.param('name'); }
                             res.render('signup-done', {
                                 title: 'Newgle - signup done',
                                 name: req.param('name'),
                                 result: result,
                                 err: err
                             });
                         });
        } else {
            res.send('Something went wrong...');
        }
    });
});
app.post('/logout', function(req, res) {
    delete req.session.user;
    res.send('Logout finished.');
});
app.get('/api', function(req, res) {
    var params = {
        q: req.param("q"),
        p: req.param("p") ? req.param("p") : 1
    };
    // bing.search(params, function(err, result) {
    yahoo.search(params, function(err, result) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.send(util.htmlspecialchars_decode(result));
    });
});

if (!module.parent) {
    app.listen(process.env.PORT || 3000);
    console.log("Express server listening on port %d", app.address().port);
}

