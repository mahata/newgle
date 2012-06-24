(function () {
    var util = {},
        crypto = require('crypto');

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = util;
    }

    // for Yahoo! JP (it returns weird result)
    util.htmlDecode = function(str) {
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

    util.parseQuery = function(q) {
        var lang = 'ja',
            regexp = q.match(/\s?lang:(en|ja)\s?/);

        if (regexp !== null) {
            q = q.replace(regexp[0], '');
            lang = regexp[1];
        }

        return {'q': q, 'lang': lang};
    };
}());
