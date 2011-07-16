(function () {
     var bing = {};

     if (typeof module !== "undefined" && module.exports) {
         module.exports = bing;
     }

     // initialize
     var fs = require("fs");
     var http = require("http");
     var bing_conf = JSON.parse(fs.readFileSync("conf/bing.json", "utf-8"));

     bing.search = function(q, callback) {
         var path = bing_conf.path + "?" + require('querystring')
             .stringify({sources: "web",
                         Appid: bing_conf.appid,
                         query: q,
                         "Web.Count": 50,
                         "Market": "ja-JP"
                        });
         http.get({ host: bing_conf.host, path: path, port: 80},
                  function(res) {
                      var json ="";
                      res.setEncoding("utf8");
                      res.on("data", function(chunk) {
                                 json += chunk;
                             });
                      res.on("end", function(chunk) {
                                 callback(json);
                             });
                  }).on("error", function(e) {
                            console.log("Got error: " + e.message);
                        });
     }
}());

