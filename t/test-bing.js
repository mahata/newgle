var vows = require("vows");
var assert = require("assert");

console.log("Bing Test Start.");

vows.describe("Bing Search Library").addBatch({
    "bing variable": {
        topic: require(__dirname + "/../lib/bing"),
        "is an object": function(topic) {
            assert.equal("object", typeof topic);
        },
        "has a search function": function(topic) {
            assert.equal("function", typeof topic.search);
        },
        "in search function": {
            topic: function(bing) {
                var params = {
                    q: "bing",
                    p: 1
                };
                bing.search(params, this.callback);
            },
            "there are search results": function(err, result) {
                var search_result = JSON.parse(result);
                assert.equal(0 < parseInt(search_result.SearchResponse.Web.Total), true);
            }
        }
    }
}).export(module);
