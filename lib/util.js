(function () {
    var util = {},
        crypto = require('crypto');

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = util;
    }

    // for Yahoo! JP (it returns weird result)
    util.html_decode = function(str) {
        return str.
            split('&amp;quot;').join('"').
            split('&amp;#39;').join("'").
            split('&amp;apos;').join("'").
            split('&amp;middot;').join("·").
            split('&amp;lt;').join("<").
            split('&amp;gt;').join(">").
            split('&amp;amp;').join("&");
    };

    util.getStretchedPassword = function(pass, salt, stretchTimes) {
        var stretchedPass = crypto.createHash('sha1').update(pass + salt).digest('hex');
        for (var i = 0; i < stretchTimes - 1; i++) {
            stretchedPass = crypto.createHash('sha1').update(stretchedPass).digest('hex');
        }

        return stretchedPass;
    };
}());
