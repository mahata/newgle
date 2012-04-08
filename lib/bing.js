(function () {
    var bing = {};

    if (typeof module !== "undefined" && module.exports) {
        module.exports = bing;
    }

    var fs = require("fs");
    var http = require("http");

    bing.search = function(params, callback) {
        var count = 10;
        var offset = count * (params.p - 1);
        offset = (offset < 0) ? 0 : offset;
        var path = process.env.BING_SEARCH_PATH + "?" + require('querystring')
            .stringify({"sources": "web",
                        "Appid": process.env.BING_SEARCH_APP_ID,
                        "query": params.q,
                        "Web.Count": count,
                        "Web.Offset": offset,
                        "Market": "ja-JP"
                       });
        http.get({ host: process.env.BING_SEARCH_HOST, path: path, port: 80},
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

