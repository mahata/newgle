(function () {
     var bing = {};

     if (typeof module !== "undefined" && module.exports) {
         module.exports = bing;
     }

     var fs = require("fs");
     var http = require("http");
     var conf = JSON.parse(fs.readFileSync("conf/conf.json", "utf-8"));

     bing.search = function(req, callback) {
         var count = 10;
         var offset = count * (req.param("p") - 1);
         offset = (offset < 0) ? 0 : offset;
         var path = conf.path + "?" + require('querystring')
             .stringify({"sources": "web",
                         "Appid": conf.appid,
                         "query": req.param("q"),
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
                                 callback(json);
                             });
                  }).on("error", function(e) {
                            console.log("Got error: " + e.message);
                        });
     }
}());

