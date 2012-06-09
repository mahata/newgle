var client = {};

client.refresh = function(page) {
    location.hash = "#q=" + $("#q").val() + "&p=" + page;
    $('html,body').scrollTop(0);
};

client.search = function() {
    var page = client.getHashParams(location.hash).p ? client.getHashParams(location.hash).p : 1,
        searchEngine = localStorage.getItem("search-engine") ? localStorage.getItem("search-engine") : "bing";

    $.cookie('search-lock', 1);
    $("#search-region").css("opacity", "0.3");
    $("#search-region").html('<div id="loading"><img src="/images/loading.gif" alt="検索中" /></div>');
    $.getJSON("/api", {
        "q": $("#q").val(),
        "p": page,
        "search-engine": searchEngine
    }, function(json) {
        document.title = 'Newgle - ' + $('#q').val();
        $("#search-summary").css("display","block");
        $("#bing-logo").css("display","block");
        $("#search-region").html("");
        $("#search-word").text($("#q").val());
        $("#search-hit-range-from").text((undefined === json.SearchResponse.Web.Results || 0 === json.SearchResponse.Web.Results.length) ? 0 : (json.SearchResponse.Web.Offset + 1));
        $("#search-hit-range-to").text(json.SearchResponse.Web.Offset + ((undefined === json.SearchResponse.Web.Results) ? 0 : json.SearchResponse.Web.Results.length));
        $("#search-hit-num").text(
            json.SearchResponse.Web.Total.toString().replace(/([0-9]+?)(?=(?:[0-9]{3})+$)/g , "$1,"));

        if (undefined === json.SearchResponse.Web.Results) {
            $('#search-region').append('<p>検索の結果、全くページが見つかりませんでした...。</p>');
        } else {
            var search_result = new EJS({url: "../templates/search.ejs"}).render({"SearchResponse": json.SearchResponse,
                                                                                  "displayThumbnail": localStorage.getItem("display-thumbnail")}),
                pagingHtml = "";
            $("#search-region").append(search_result);

            if (1 < page) {
                pagingHtml += "<a href=\"javascript:void(0);\" onclick=\"client.refresh(" + (parseInt(page, 10) - 1) + "); return false;\">&laquo; 前の検索結果を見る</a>";
            }
            if (json.SearchResponse.Web.Offset + json.SearchResponse.Web.Results.length < json.SearchResponse.Web.Total) {
                if ("" !== pagingHtml) { pagingHtml += "&nbsp;|&nbsp;"; }
                pagingHtml += "<a href=\"javascript:void(0);\" onclick=\"client.refresh(" + (parseInt(page, 10) + 1) + "); return false;\">もっと検索結果を見る&raquo;</a>";
            }
            $("#search-pager").html(pagingHtml);
        }

        location.hash = "#q=" + $("#q").val() + "&p=" + page;
        $("#search-region").css("opacity", "1.0");

        $("#search-logo-image").attr("src", "/images/" + searchEngine + "-logo.png");
        $("#search-logo-url").attr("href", client.getSearchAboutUrl(searchEngine));

        $.cookie('search-lock', 0);
    });
};

client.getHashParams = function(locHash) {
    var urlParams = {},
        e,
        a = /\+/g,
        r = /([^&=]+)=?([^&]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = locHash.substring(1);

    while (e = r.exec(q)) {
        urlParams[d(e[1])] = d(e[2]);
    }

    return urlParams;
};

client.getSearchAboutUrl = function(serviceName) {
    switch (serviceName) {
    case "yahoo":
        return "http://developer.yahoo.co.jp/about";
        break;
    case "bing":
        return "http://www.bing.com/toolbox/bingdeveloper/";
        break;
    default:
        break;
    }

    return false;
};

$(function(){
    // for paging like: search result => search page using BACK button of browsers
    var hashParams = client.getHashParams(location.hash);
    if (hashParams.q && "" !== hashParams.q) {
        $("#q").val(hashParams.q);
        client.search();
    }

    // for paging like: page2 => page1 using BACK button of browsers
    $(window).bind("hashchange", function() {
        if (0 === parseInt($.cookie('search-lock'), 10)) {
            $('html,body').scrollTop(0);
            client.search();
        }
    });
});
