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
    router = require(__dirname + "/lib/router"),

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
        name: req.session.name
    });
});
app.get('/test', router.domainCheck, function(req, res) {
    console.log(router.domainCheck);
    var _segmenter = new segmenter.TinySegmenter();
    var segs = _segmenter.segment("私の名前は中野です");
    res.send(segs.join(" | "));
});
app.get('/config', function(req, res) {
    if (undefined !== req.session.name) {
        pg.connect(conString, function(err, client) {
            if (null !== client) {
                client.query('SELECT search_engine FROM conf WHERE member_id = (SELECT id FROM member WHERE name = $1)',
                             [req.session.name],
                             function(err, result) {
                                 res.render('config', {
                                     title: 'Newgle - config',
                                     search_engine: result.rows[0] ? result.rows[0].search_engine : null
                                 });
                             });
            } else {
                res.send('It seems connecting to the PostgreSQL failed.');
            }
        });
    } else {
        res.send('You must be logged in to set config.');
    }
});
app.post('/config', function(req, res) {
    if (undefined !== req.session.name) {
        pg.connect(conString, function(err, client) {
            if (null !== client) {
                client.query('SELECT set_config($1, $2)', // INSERT-UPDATE
                             [req.session.name, req.param('search-engine')],
                             function(err, result) {
                                 res.render('config-done', {
                                     title: 'Newgle - config done',
                                     result: result,
                                     err: err
                                 });
                             });
            } else {
                res.send('It seems connecting to the PostgreSQL failed.');
            }
        });
    } else {
        res.send('You must be logged in to set config.');
    }
});
app.get('/login', function(req, res) {
    res.render('login', {
        title: 'Newgle - login'
    });
});
app.post('/login', function(req, res) {
    pg.connect(conString, function(err, client) {
        if (null !== client) {
            client.query('SELECT name FROM member WHERE name = $1 AND pass = $2',
                         [req.param('name'), util.getStretchedPassword(req.param('pass'),
                                                                       req.param('name'),
                                                                       process.env.STRETCH_TIMES)],
                         function(err, result) {
                             if (null === err &&
                                 undefined !== result.rows[0] &&
                                 result.rows[0].name === req.param('name')) {
                                 req.session.name = req.param('name');
                             }
                             res.render('login-done', {
                                 title: 'Newgle - login done',
                                 name: req.session.name,
                                 result: result,
                                 err: err
                             });
                         });
        } else {
            res.send('It seems connecting to the PostgreSQL failed.');
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
            client.query('INSERT INTO member (name, pass, created_at) VALUES ($1, $2, $3)',
                         [req.param('name'),
                          util.getStretchedPassword(req.param('pass'),
                                                    req.param('name'),
                                                    process.env.STRETCH_TIMES),
                          parseInt((new Date)/1e3)],
                         function(err, result) {
                             if (null === err) { req.session.name = req.param('name'); }
                             res.render('signup-done', {
                                 title: 'Newgle - signup done',
                                 name: req.param('name'),
                                 result: result,
                                 err: err
                             });
                         });
        } else {
            res.send('It seems connecting to the PostgreSQL failed.');
        }
    });
});
app.get('/logout', function(req, res) {
    delete req.session.name;
    res.send('Logout finished.');
});
app.get('/api', function(req, res) {
    var params = {
        q: req.param("q"),
        p: req.param("p") ? req.param("p") : 1
    };

    if (undefined !== req.session.name) {
        pg.connect(conString, function(err, client) {
            if (null !== client) {
                client.query('SELECT search_engine FROM conf WHERE member_id = (SELECT id FROM member WHERE name = $1)',
                             [req.session.name],
                             function(err, result) {
                                 var search = null;
                                 if (undefined === result.rows[0]) { search = bing; } // default
                                 else if ('yahoo' === result.rows[0].search_engine) { search = yahoo; }
                                 else if ('bing' === result.rows[0].search_engine) { search = bing; }

                                 if (null === search) {
                                     console.log('Configuration data seems corrupt.');
                                 } else {
                                     search.search(params, function(err, result) {
                                         res.setHeader("Content-Type", "application/json; charset=utf-8");
                                         res.send(result);
                                     });
                                 }
                             });
            } else {
                res.send('It seems connecting to the PostgreSQL failed.');
            }
        });
    } else {
        // default is bing search
        bing.search(params, function(err, result) {
        // yahoo.search(params, function(err, result) {
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.send(result);
        });
    }
});

if (!module.parent) {
    app.listen(process.env.PORT || 3000);
    console.log("Express server listening on port %d", app.address().port);
}

