/**
 * Module dependencies.
 */

var express = require('express');
var io = require('socket.io');
var db = require('dirty')('log.db');
var fs = require('fs');
var pg = require('pg');
var http = require('http');

var calc = require(__dirname + "/lib/calc"); // remove it later
var bing = require(__dirname + "/lib/bing");
var yahoo = require(__dirname + "/lib/yahoo");
var segmenter = require(__dirname + "/lib/segmenter");
var util = require(__dirname + "/lib/util");

var conString = 'postgres://' + process.env.PGSQL_USER + ':' + process.env.PGSQL_PASS + '@' + process.env.PGSQL_HOST + '/' + process.env.PGSQL_DB;
var app = module.exports = express.createServer();

// Configuration
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
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
    res.render('search', {
        title: 'Newgle',
        q: req.param("q")
    });
});
app.get('/test', function(req, res) {
    console.log("add: " + calc.add(10, 2));
    console.log("sub: " + calc.sub(10, 2));
    console.log("mul: " + calc.mul(10, 2));
    console.log("div: " + calc.div(10, 2));

    res.send("Hi!");
});
app.get('/test2', function(req, res) {
    var _segmenter = new segmenter.TinySegmenter();
    var segs = _segmenter.segment("私の名前は中野です");
    res.send(segs.join(" | "));
});
app.get('/login', function(req, res) {
    res.render('login', {
        title: 'Newgle - login'
    });
});
app.get('/signup', function(req, res) {
    res.render('signup', {
        title: 'Newgle - signup'
    });
});
app.post('/signup', function(req, res) {
    pg.connect(conString, function(err, client) {
        client.query('INSERT INTO users (name, pass) VALUES ($1, $2)',
                     [req.param('name'), req.param('pass')],
                     function(err, result) {
                         // err.code, err.message
                     });
    });
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

