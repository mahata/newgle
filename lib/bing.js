(function () {
    var bing = {},
        async = require('async'),
        http = require('http'),
        https = require('https'),
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
            // https://api.datamarket.azure.com/Data.ashx/Bing/Search/v1/Web?Query=%27xbox%27&Market=%27ja-JP%27&$top=50&$skip=50&$format=json
            // (urldecode) https://api.datamarket.azure.com/Data.ashx/Bing/Search/v1/Web?Query='xbox'&Market='ja-JP'&$top=50&$skip=50&$format=json
            function(_callback) {
                path = process.env.AZURE_BING_SEARCH_PATH + '?' + require('querystring').stringify({
                    'Query': "'" + parsedQuery['q'] + "'",
                    '$top': count,
                    '$skip': offset,
                    '$format': 'json',
                    'Market': (parsedQuery['lang'] == 'ja') ? "'ja-JP'" : "'en-US'"
                });

                https.get({
                    host: process.env.AZURE_BING_SEARCH_HOST,
                    path: path,
                    port: 443,
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded',
                        Authorization: 'Basic ' +
                            new Buffer('this_does_not_matter:' + process.env.AZURE_BING_ACCOUNT_KEY).toString('base64')
                    }
                }, function(res) {
                    var json ='';
                    res.setEncoding('utf8');
                    res.on('data', function(chunk) {
                        json += chunk;
                    });
                    res.on('end', function(chunk) {
                        var jsonObj = {
                            SearchResponse: {
                                Query: {
                                    SearchTerms: params.q
                                },
                                Web: {
                                    Total: 1000, // dummy
                                    Offset: 0,
                                    Results: JSON.parse(json).d.results
                                }
                            }
                        };

                        _callback(null, JSON.stringify(jsonObj));
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

