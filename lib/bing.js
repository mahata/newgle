(function () {
     var bing = {};

     if (typeof module !== "undefined" && module.exports) {
         module.exports = bing;
     }

     // initialize
     var async = require('async');
     var fs = require("fs");
     var http = require("http");
     var bing_conf = JSON.parse(fs.readFileSync("conf/bing.json", "utf-8"));

     bing.search = function(q, callback) {
         async.waterfall([function(inner_callback) {
                              inner_callback(null, bing_conf);
                          },
                          function(arg, inner_callback) {
                              var path =
                                  arg.path + "?" + require('querystring')
                                  .stringify({sources: "web",
                                              Appid: arg.appid,
                                              query: q});

                              http.get({ host: arg.host,
                                         path: path,
                                         port: 80},
                                       function(res) {
                                           var json ="";
                                           res.setEncoding("utf8");
                                           res.on("data", function(chunk) {
                                                      json += chunk;
                                                  });
                                           res.on("end", function(chunk) {
                                                      inner_callback(null, json);
                                                  });
                                       }).on("error", function(e) {
                                                 console.log("Got error: " + e.message);
                                             });
                          }
                         ], function(err, result) {
                             if (err) {
                                 throw err;
                             }
                             // console.log("result: " + result);
                             callback(result);
                         });
     }
}());

