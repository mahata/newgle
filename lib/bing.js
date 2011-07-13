(function () {
     var bing = {};

     if (typeof module !== "undefined" && module.exports) {
         module.exports = bing;
     }

     // initialize
     var fs = require("fs");
     var bing_conf = JSON.parse(fs.readFileSync("./conf/bing.json", "utf-8"));

     bing.a = function() {
         console.log("a:");
         console.log("c: " + bing_conf);
         console.log("d: " + bing_conf.appid);
     }

     bing.search = function(q) {
         http.get(options, function(res) {
                      var json = "";
                      res.on("data", function(chunk) {
                             });
                      res.on("end", function(chunk) {
                             })
                  }).on("error", function(e) {
                        });
     }
}());

