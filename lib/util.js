(function () {
    var util = {},
        crypto = require('crypto');

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = util;
    }

    util.htmlspecialchars = function(str) {
        str = str.split('<').join('&lt;');
        str = str.split('>').join('&gt;');
        str = str.split('"').join('&quot;');
        str = str.split("'").join('&#039;');
        str = str.split('&').join('&amp;');

        return str;
    };

    util.htmlspecialchars_decode = function(str) {
        str = str.split('&lt;').join('<');
        str = str.split('&gt;').join('>');
        str = str.split('&quot;').join('"');
        str = str.split('&#039;').join("'");
        str = str.split('&amp;').join('&');

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
