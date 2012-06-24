(function () {
    var bing = {},
        async = require('async'),
        http = require('http'),
        util = require(__dirname + '/util');

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = bing;
    }

    bing.search = function(params, callback) {
        var count = 20,
            offset = count * (params.p - 1) < 0 ? 0 : count * (params.p - 1),
            parsedQuery = util.parseQuery(params.q),
            path = '',
            tasks = [];

        tasks.push(
            function(_callback) {
                path = process.env.BING_SEARCH_PATH + '?' + require('querystring').stringify({
                    'sources': 'web',
                    'Appid': process.env.BING_SEARCH_APP_ID,
                    'query': parsedQuery['q'],
                    'Web.Count': count,
                    'Web.Offset': offset,
                    'Market': (parsedQuery['lang'] == 'ja') ? 'ja-JP' : 'en-US'
                });
                console.log(path);

                http.get({ host: process.env.BING_SEARCH_HOST, path: path, port: 80},
                         function(res) {
                             var json ='';
                             res.setEncoding('utf8');
                             res.on('data', function(chunk) {
                                 json += chunk;
                             });
                             res.on('end', function(chunk) {
                                 _callback(null, json);
                             });
                         }).on('error', function(e) {
                             console.log('Got error: ' + e.message);
                         });
            }
        );

        async.waterfall(tasks, function(err, result) {
            if (err) { console.err(err); }
            callback(null, result);
        });
    };
}());

