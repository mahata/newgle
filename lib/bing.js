(function () {
     var bing = {};

     if (typeof module !== "undefined" && module.exports) {
         module.exports = bing;
     }

     var fs = require("fs");
     var http = require("http");
     var conf = JSON.parse(fs.readFileSync(__dirname + "/../conf/conf.json", "utf-8"));

     bing.search = function(params, callback) {
         var count = 10;
         var offset = count * (params.p - 1);
         offset = (offset < 0) ? 0 : offset;
         var path = conf.path + "?" + require('querystring')
             .stringify({"sources": "web",
                         "Appid": conf.appid,
                         "query": params.q,
                         "Web.Count": count,
                         "Web.Offset": offset,
                         "Market": "ja-JP"
                        });
         http.get({ host: conf.host, path: path, port: 80},
                  function(res) {
                      var json ="";
                      res.setEncoding("utf8");
                      res.on("data", function(chunk) {
                                 json += chunk;
                             });
                      res.on("end", function(chunk) {
                                 callback(null, json);
                             });
                  }).on("error", function(e) {
                            console.log("Got error: " + e.message);
                        });
     }
}());

