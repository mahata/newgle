(function () {
    var bing = {},
        http = require('http');

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = bing;
    }

    bing.search = function(params, callback) {
        var count = 10,
            offset = count * (params.p - 1) < 0 ? 0 : count * (params.p - 1),
            path = process.env.BING_SEARCH_PATH + '?' + require('querystring').stringify({
                'sources': 'web',
                'Appid': process.env.BING_SEARCH_APP_ID,
                'query': params.q,
                'Web.Count': count,
                'Web.Offset': offset,
                'Market': 'ja-JP'
            });

        http.get({ host: process.env.BING_SEARCH_HOST, path: path, port: 80},
                 function(res) {
                     var json ='';
                     res.setEncoding('utf8');
                     res.on('data', function(chunk) {
                         json += chunk;
                     });
                     res.on('end', function(chunk) {
                         callback(null, json);
                     });
                 }).on('error', function(e) {
                     console.log('Got error: ' + e.message);
                 });
    }
}());

