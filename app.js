
/**
 * Module dependencies.
 */

var express = require('express');
var io = require('socket.io');
var db = require('dirty')('log.db');
var async = require('async');
var http = require('http');
var calc = require("./lib/calc"); // remove it later
var bing = require("./lib/bing");
// var json = JSON.stringify;

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
            res.render('index', {
                           title: 'ウェブ検索'
                       });
        });
app.get('/test', function(req, res){
            console.log("add: " + calc.add(10, 2));
            console.log("sub: " + calc.sub(10, 2));
            console.log("mul: " + calc.mul(10, 2));
            console.log("div: " + calc.div(10, 2));
            console.log("bing: " + bing.a());

            res.send("Hi!");
        });
app.get('/api', function(req, res){
            async.waterfall([function(callback) {
                                 var fs = require("fs");
                                 var bing_conf = JSON.parse(fs.readFileSync("./conf/bing.json", "utf-8"));
                                 callback(null, bing_conf);
                             },
                             function(arg, callback) {
                                 var path =
                                     arg.path + "?" + require('querystring')
                                     .stringify({sources: "web",
                                                 Appid: arg.appid,
                                                 query: req.param("q")});

                                 http.get({ host: arg.host,
                                            path: path,
                                            port: 80},
                                          function(bing_res) {
                                              var json ="";
                                              bing_res.setEncoding("utf8");
                                              bing_res.on("data", function(chunk) {
                                                              json += chunk;
                                                          });
                                              bing_res.on("end", function(chunk) {
                                                              callback(null, json);
                                                          });
                                          }).on("error", function(e) {
                                                    console.log("Got error: " + e.message);
                                                });
                             }
                            ], function(err, result) {
                                if (err) {
                                    throw err;
                                }
                                res.send(result);
                            });
        });

if (!module.parent) {
    app.listen(3000);
    console.log("Express server listening on port %d", app.address().port);
}

var socket = io.listen(app);
var count = 0;
socket.on("connection", function(client) {
              console.log("data come from client");

              client.on("message", function(q) {
                            console.log("client kara query ga kita.");
                            console.log(q);
                            // client.broadcast(q); // for other clients
                            client.send(q); // for current client
                        });
          });

