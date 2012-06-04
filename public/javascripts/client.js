var client = {};

client.refresh = function(page) {
    location.hash = "#q=" + $("#q").val() + "&p=" + page;
    $('html,body').scrollTop(0);
};

client.search = function() {
    var page = client.getHashParams(location.hash).p ? client.getHashParams(location.hash).p : 1;

    $.cookie('search-lock', 1);
    $("#search-region").css("opacity", "0.3");
    $("#search-region").html('<div id="loading"><img src="/images/loading.gif" alt="検索中" /></div>');
    $.getJSON("/api", {
        q: $("#q").val(),
        p: page
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
            var search_result = new EJS({url: "../templates/search.ejs"}).render(json.SearchResponse);
            $("#search-region").append(search_result);
            // $.each($('.search-result-desc'), function(i, desc) {
            //     $('#search-result-desc-id-' + i).html(client.emphasizeKeyword($(desc).text(), $("#q").val()));
            // });

            var pagingHtml = "";
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

    while (e = r.exec(q))
        urlParams[d(e[1])] = d(e[2]);

    return urlParams;
};

// emphasize keyword from a text (will be removed)
// client.emphasizeKeyword = function(text, keyword) {
//     var keywordList = keyword.trim().replace(/[　\s]+/, " ").split(" ");

//     for (var i = 0; i < keywordList.length; i++) {
//         var reg = new RegExp("(" + keywordList[i] + ")", "gi");
//         text = text.replace(reg, "<strong>$1</strong>");
//     }

//     return text;
// };

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

