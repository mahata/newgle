(function () {
     var segmenter = {};

     if (typeof module !== "undefined" && module.exports) {
         module.exports = segmenter;
     }

     // initialize
     var fs = require("fs");

     eval(fs.readFileSync("lib/tiny_segmenter-0.1.js", "utf-8"));
     segmenter.TinySegmenter = TinySegmenter;
}());

// var segmenter = require("./lib/importer.js");
// 
