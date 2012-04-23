(function () {
    var bing = {},
        async = require('async'),
        // redis = require('redis'),
        http = require('http');

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = bing;
    }

    bing.search = function(params, callback) {
        var count = 20,
            offset = count * (params.p - 1) < 0 ? 0 : count * (params.p - 1),
            // client = redis.createClient(),
            // key = 'bing|' + encodeURIComponent(params.q) + '|' + offset + '|' + count,
            path = '',
            tasks = [];

        tasks.push(
            function(_callback) {
                // client.get(key, function(err, reply) {
                //     if (null !== reply) {
                //         callback(null, reply.toString()); // cache hit
                //         return;
                //     }

                    _callback(null);
                // });
            }, function(_callback) {
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
                                 // client.set(key, json); // cache set
                                 // client.expire(key, 86400); // cache expires in a day
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

