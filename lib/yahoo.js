(function () {
    var yahoo = {},
        http = require('http');

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = yahoo;
    }

    yahoo.search = function(params, callback) {
        var count  = 10,
            offset = count * (params.p - 1) < 0 ? 0 : count * (params.p - 1),
            path   = process.env.YAHOO_SEARCH_PATH + '?' + require('querystring').stringify({
                'appid': process.env.YAHOO_SEARCH_APP_ID,
                'query': params.q,
                'num': count,
                'start': offset + 1,
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
                         var jsdom         = require('jsdom').jsdom,
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
                                         'Results': [],
                                     }
                                 }
                             };

                         for (var i = 0; i < results.length; i++) {
                             var tObj = {
                                 'Title': results[i].getElementsByTagName('title')[0].innerHTML,
                                 'Description': results[i].getElementsByTagName('summary')[0].innerHTML,
                                 'Url': results[i].getElementsByTagName('url')[0].innerHTML,
                                 'DateTime': results[i].getElementsByTagName('modificationdate')[0].innerHTML,
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

                         callback(null, JSON.stringify(json));
                     });
                 }).on('error', function(e) {
                     console.log('Got error: ' + e.message);
                 });
    }
}());
