(function () {
    var util = {},
        crypto = require('crypto');

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = util;
    }

    // for Yahoo! JP (it returns weird result)
    util.html_decode = function(str) {
        str = str.split('&amp;quot;').join('"');
        str = str.split('&amp;#39;').join("'");

        return str;
    };

    util.getStretchedPassword = function(pass, salt, stretchTimes) {
        var stretchedPass = crypto.createHash('sha1').update(pass + salt).digest('hex');
        for (var i = 0; i < stretchTimes - 1; i++) {
            stretchedPass = crypto.createHash('sha1').update(stretchedPass).digest('hex');
        }

        return stretchedPass;
    };
}());
