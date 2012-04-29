/**
 * Module dependencies.
 */

var express = require('express'),
    async = require('async'),
    io = require('socket.io'),
    db = require('dirty')('log.db'),
    fs = require('fs'),
    pg = require('pg'),
    http = require('http'),
    crypto = require('crypto'),
    // scheme = require('biwascheme'),

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
app.get('/', router.domainCheck, function(req, res) {
    if (undefined !== req.param('q')) {
        res.redirect('/#q=' + req.param('q') + '&p=1');
        return;
    }

    res.render('search', {
        name: (undefined === (typeof req.session)) ? undefined : req.session.name,
        searchBox: true,
        title: 'Newgle'
    });
});
app.get('/test', router.domainCheck, function(req, res) {
    var _segmenter = new segmenter.TinySegmenter(),
        segs = _segmenter.segment("私の名前は中野です");
    res.send(segs.join(" | "));
});
app.get('/config', router.domainCheck, router.loginCheck, function(req, res) {
    var tasks = [
        function(callback) {
            pg.connect(conString, function(err, client) {
                callback(null, client);
            });
        }, function(client, callback) {
            client.query('SELECT search_engine FROM conf WHERE member_id = (SELECT id FROM member WHERE name = $1)',
                         [req.session.name],
                         function(err, selectResult) {
                             callback(null, selectResult);
                         });
        }, function(selectResult, callback) {
            res.render('config', {
                name: req.session.name,
                title: 'Newgle - config',
                search_engine: selectResult.rows[0] ? selectResult.rows[0].search_engine : null
            });
            callback(null, 'done')
        }
    ];

    async.waterfall(tasks, function(err, result) {
        if (err) { console.err(err); }
    });
});
app.post('/config', router.domainCheck, router.loginCheck, function(req, res) {
    var tasks = [
        function(callback) {
            pg.connect(conString, function(err, client) {
                callback(null, client);
            });
        }, function(client, callback) {
            client.query('SELECT set_config($1, $2)', // INSERT-UPDATE
                         [req.session.name, req.param('search-engine')],
                         function(err, selectResult) {
                             callback(null, selectResult);
                         });
        }, function(selectResult, callback) {
            res.render('config-done', {
                name: req.session.name,
                title: 'Newgle - config done',
                result: selectResult
            });
            callback(null, 'done');
        }
    ];

    async.waterfall(tasks, function(err, result) {
        if (err) { console.err(err); }
    });
});
app.get('/help', router.domainCheck, function(req, res) {
    res.render('help', {
        title: 'Newgle - help',
        name: (undefined === (typeof req.session)) ? undefined : req.session.name
    });
});
app.get('/login', router.domainCheck, function(req, res) {
    res.render('login', {
        title: 'Newgle - login',
        name: null
    });
});
app.post('/login', router.domainCheck, function(req, res) {
    var tasks = [
        function(callback) {
            pg.connect(conString, function(err, client) {
                callback(null, client);
            });
        }, function(client, callback) {
            client.query('SELECT name FROM member WHERE name = $1 AND pass = $2',
                         [req.param('name'), util.getStretchedPassword(req.param('pass'),
                                                                       req.param('name'),
                                                                       process.env.STRETCH_TIMES)],
                         function(err, selectResult) {
                             callback(null, selectResult);
                         });
        }, function(selectResult, callback) {
            req.session.name = (undefined === selectResult.rows[0]) ? undefined : req.param('name');
            res.render('login-done', {
                title: 'Newgle - login done',
                name: req.session.name,
                result: selectResult
            });
            callback(null, 'done');
        }
    ];

    async.waterfall(tasks, function(err, result) {
        if (err) { console.err(err); }
    });
});
app.get('/signup', router.domainCheck, function(req, res) {
    res.render('signup', {
        title: 'Newgle - signup',
        name: null
    });
});
app.post('/signup', router.domainCheck, function(req, res) {
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
app.get('/logout', router.domainCheck, function(req, res) {
    delete req.session.name;
    // res.send('Logout finished.');
    res.redirect('/');
});
app.get('/api', router.domainCheck, function(req, res) {
    var params = {
        q: req.param("q"),
        p: req.param("p") ? req.param("p") : 1
    };

    if (undefined === req.session.name) {
        bing.search(params, function(err, result) { // Bing is the default search engine
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.send(result);
        });

        return;
    }

    var tasks = [
        function(callback) {
            pg.connect(conString, function(err, client) {
                callback(null, client);
            });
        }, function(client, callback) {
            client.query('SELECT search_engine FROM conf WHERE member_id = (SELECT id FROM member WHERE name = $1)',
                         [req.session.name],
                         function(err, selectResult) {
                             callback(null, selectResult);
                         });
        }, function(selectResult, callback) {
            var search = null;
            if (undefined === selectResult.rows[0]) { search = bing; } // default
            else if ('yahoo' === selectResult.rows[0].search_engine) { search = yahoo; }
            else if ('bing' === selectResult.rows[0].search_engine) { search = bing; }

            if (null === search) {
                console.log('Configuration data seems corrupt.');
            } else {
                search.search(params, function(err, selectResult) {
                    res.setHeader("Content-Type", "application/json; charset=utf-8");
                    res.send(selectResult);
                });
                callback(null, 'done');
            }
        }
    ];

    async.waterfall(tasks, function(err, result) {
        if (err) { console.err(err); }
    });
});

if (!module.parent) {
    app.listen(process.env.PORT || 3000);
    console.log("Express server listening on port %d", app.address().port);
}

