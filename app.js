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
    url = require('url'),
    crypto = require('crypto'),
    // RedisStore = require('connect-redis')(express),
    router = require(__dirname + "/lib/router"),

    bing = require(__dirname + "/lib/bing"),
    yahoo = require(__dirname + "/lib/yahoo"),
    engine = {"bing": bing, "yahoo": yahoo},

    app = module.exports = express.createServer();

// Configuration
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express["static"](__dirname + '/public'));
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
        "js": "client",
        "searchBox": true,
        "title": "Newgle"
    });
});
app.get('/config', router.domainCheck, function(req, res) {
    res.render('config', {
        "js": 'config',
        "title": 'Newgle - config'
    });
});
app.get('/help', router.domainCheck, function(req, res) {
    res.render('help', {
        "title": 'Newgle - help',
        "js": ""
    });
});
app.get('/api', router.domainCheck, function(req, res) {
    var params = {
            "q": req.param("q"),
            "p": req.param("p") ? req.param("p") : 1
        },
        searchEngine = engine[req.param("search-engine")];

    searchEngine.search(params, function(err, result) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.send(result);
    });
});

if (!module.parent) {
    app.listen(process.env.PORT || 3000);
    console.log("Express server listening on port %d", app.address().port);
}

