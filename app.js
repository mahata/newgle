
/**
 * Module dependencies.
 */

var express = require('express');
var io = require('socket.io');
var db = require('dirty')('log.db');
var fs = require("fs");
var http = require('http');

var calc = require("./lib/calc"); // remove it later
var bing = require("./lib/bing");
var segmenter = require("./lib/segmenter");

var app = module.exports = express.createServer();

// --
// Configuration
// --
app.configure(function(){
                  app.set('views', __dirname + '/views');
                  app.set('view engine', 'jade');
                  app.use(express.bodyParser());
                  app.use(express.methodOverride());
                  app.use(app.router);
                  app.use(express.static(__dirname + '/public'));
              });
app.configure('development', function(){
                  express.logger('development mode');
                  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
              });
app.configure('production', function(){
                  express.logger('production mode');
                  app.use(express.errorHandler());
              });

// --
// Routes
// --
app.get('/', function(req, res){
            var conf = JSON.parse(fs.readFileSync("conf/conf.json", "utf-8"));
            res.render('search', {
                           title: 'Newgle',
                           q: req.param("q"),
                           conf: conf
                       });
        });
app.get('/test', function(req, res){
            console.log("add: " + calc.add(10, 2));
            console.log("sub: " + calc.sub(10, 2));
            console.log("mul: " + calc.mul(10, 2));
            console.log("div: " + calc.div(10, 2));

            res.send("Hi!");
        });
app.get('/test2', function(req, res){
            var _segmenter = new segmenter.TinySegmenter();
            var segs = _segmenter.segment("私の名前は中野です");
            res.send(segs.join(" | "));
        });
app.get('/api', function(req, res){
            bing.search(req, function(result) {
                            res.setHeader("Content-Type", "application/json; charset=utf-8");
                            res.send(result);
                        });
        });

if (!module.parent) {
    app.listen(3000);
    console.log("Express server listening on port %d", app.address().port);
}

