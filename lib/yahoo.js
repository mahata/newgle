(function () {
    var yahoo = {},
        async = require('async'),
        http = require('http'),
        // redis = require('redis'),
        util = require(__dirname + '/util');

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = yahoo;
    }

    yahoo.search = function(params, callback) {
        var count = 20,
            offset = count * (params.p - 1) < 0 ? 0 : count * (params.p - 1),
            // client = redis.createClient(),
            key = 'yahoo|' + encodeURIComponent(params.q) + '|' + offset + '|' + count,
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
                path = process.env.YAHOO_SEARCH_PATH + '?' + require('querystring').stringify({
                    'appid': process.env.YAHOO_SEARCH_APP_ID,
                    'query': params.q,
                    'results': count,
                    'start': offset + 1
                    // 'language': 'ja'
                });

                http.get({ host: process.env.YAHOO_SEARCH_HOST, path: path, port: 80},
                         function(res) {
                             var xml ='';
                             res.setEncoding('utf8');
                             res.on('data', function(chunk) {
                                 xml += chunk;
                             });
                             res.on('end', function(chunk) {
                                 var jsdom     = require('jsdom').jsdom,
                                 document      = jsdom(xml),
                                 resultSetNode = document.getElementsByTagName('ResultSet')[0],
                                 results       = document.getElementsByTagName('Result'),
                                 json          = {
                                     'SearchResponse': {
                                         'Query': {
                                             'SearchTerms': params.q
                                         },
                                         'Web': {
                                             'Total': resultSetNode.getAttribute('totalresultsavailable'),
                                             'Offset': resultSetNode.getAttribute('firstresultposition') -1,
                                             'Results': []
                                         }
                                     }
                                 };

                                 for (var i = 0; i < results.length; i++) {
                                     var tObj = {
                                         'Title': util.html_decode(results[i].getElementsByTagName('title')[0].innerHTML),
                                         'Description': util.html_decode(results[i].getElementsByTagName('summary')[0].innerHTML),
                                         'Url': results[i].getElementsByTagName('url')[0].innerHTML,
                                         'DateTime': results[i].getElementsByTagName('modificationdate')[0].innerHTML
                                     };

                                     if (results[i].getElementsByTagName('cache')[0]) {
                                         tObj['CacheUrl'] = results[i].getElementsByTagName('cache')[0].getElementsByTagName('url')[0].innerHTML;
                                     }

                                     try {
                                         tObj['DisplayUrl'] = results[i].getElementsByTagName('url')[0].innerHTML.match(/^https?:\/\/([^\/]+)\//)[1];
                                     } catch (e) {
                                         tObj['DisplayUrl'] = 'unknown domain';
                                     }

                                     json.SearchResponse.Web.Results.push(tObj);
                                 }

                                 // client.set(key, util.html_decode(JSON.stringify(json))); // cache set
                                 // client.expire(key, 86400); // cache expires in a day

                                 // _callback(null, util.html_decode(JSON.stringify(json)));
                                 _callback(null, JSON.stringify(json));
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
