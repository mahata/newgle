function refresh(page) {
    location.hash = "#q=" + $("#q").val() + "&p=" + page;
    $('html,body').scrollTop(0);

    search();
}

function search() {
    var page = get_hash_params(location.hash).p ? get_hash_params(location.hash).p : 1;

    $("#search-region").css("opacity", "0.3");
    $.getJSON("/api", {
        q: $("#q").val(),
        p: page
    }, function(json) {
        document.title = 'Newgle - ' + $('#q').val();

        $("#search-summary").css("display","block");
        $("#bing-logo").css("display","block");
        $("#search-region").html("");

        $("#search-word").text($("#q").val());
        $("#search-hit-range-from").text(json.SearchResponse.Web.Offset + 1);
        $("#search-hit-range-to").text(json.SearchResponse.Web.Offset +
                                       json.SearchResponse.Web.Results.length);
        $("#search-hit-num").text(
            json.SearchResponse.Web.Total.toString()
                .replace(/([0-9]+?)(?=(?:[0-9]{3})+$)/g , "$1,"));

        for (var i = 0; i < json.SearchResponse.Web.Results.length; i++) {
            var deep_link = "";
            if (json.SearchResponse.Web.Results[i].DeepLinks) {
                var repeat_num = (json.SearchResponse.Web.Results[i].DeepLinks.length <= 5) ? json.SearchResponse.Web.Results[i].DeepLinks.length : 5,
                    link_list = [];
                for (var j = 0; j < repeat_num; j++) {
                    link_list.push("<a href=\"" + json.SearchResponse.Web.Results[i].DeepLinks[j].Url + "\">" +
                                   emphasize_keyword(json.SearchResponse.Web.Results[i].DeepLinks[j].Title, $("#q").val()) + "</a>");
                }
                deep_link = "<div class=\"search-result-deep-link\"><strong>もっと見る:</strong> " + link_list.join(" - ") + "</div>";
            }
            $("#search-region").append("<li>" +
                                       "<div class=\"search-result\">" +
                                       "<div class=\"search-result-left\">" +
                                       "<a href=\"" + json.SearchResponse.Web.Results[i].Url + "\">" +
                                       "<img src=\"http://img.simpleapi.net/small/" +
                                       json.SearchResponse.Web.Results[i].Url +
                                       " alt=\"img\" />" +
                                       "</a>" +
                                       "</div>" +
                                       "<div class=\"search-result-right\">" +
                                       "<h2 class=\"search-result-title\">" +
                                       "<a href=\"" + json.SearchResponse.Web.Results[i].Url + "\">" +
                                       "<span id=\"search-result-title-" + i + "\"></span>" +
                                       "</a>" +
                                       "</h2>" +
                                       "<p class=\"search-result-desc\">" +
                                       "<span id=\"search-result-desc-" + i + "\"></span>" +
                                       "</p>" +
                                       "<div class=\"search-result-subtle-info\">" +
                                       "<span class=\"search-result-disp-url\">" +
                                       emphasize_keyword(json.SearchResponse.Web.Results[i].DisplayUrl, $("#q").val()) +
                                       "</span>" +
                                       " - " +
                                       "<a class=\"search-result-cache\" href=\"" + json.SearchResponse.Web.Results[i].CacheUrl + "\">キャッシュ</a>" +
                                       deep_link +
                                       "<p style=\"clear: both;\"></p>" +
                                       "</div>" +
                                       "</div>" +
                                       "</div>" +
                                       "</li>");
            $("#search-result-title-" + i).text(json.SearchResponse.Web.Results[i].Title);
            $("#search-result-desc-" + i).text(json.SearchResponse.Web.Results[i].Description);
            // $("#search-result-title-" + i).html(json.SearchResponse.Web.Results[i].Title);
            // $("#search-result-desc-" + i).html(json.SearchResponse.Web.Results[i].Description);
            $("#search-result-desc-" + i).html(emphasize_keyword($("#search-result-desc-" + i).html(), $("#q").val()));
        }

        var paging_html = "";
        if (1 < page) {
            paging_html += "<a href=\"javascript:void(0);\" onclick=\"refresh(" + (parseInt(page) - 1) + "); return false;\">&laquo; 前の検索結果を見る</a>";
        }
        if (json.SearchResponse.Web.Offset + json.SearchResponse.Web.Results.length < json.SearchResponse.Web.Total) {
            if ("" != paging_html) { paging_html += "&nbsp;|&nbsp;"; }
            paging_html += "<a href=\"javascript:void(0);\" onclick=\"refresh(" + (parseInt(page) + 1) + "); return false;\">もっと検索結果を見る&raquo;</a>";
        }
        $("#search-pager").html(paging_html);

        location.hash = "#q=" + $("#q").val() + "&p=" + page;
        $("#search-region").css("opacity", "1.0");
    });
}

function get_hash_params(loc_hash) {
    var url_params = {},
        e,
        a = /\+/g,
        r = /([^&=]+)=?([^&]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = loc_hash.substring(1);

    while (e = r.exec(q))
        url_params[d(e[1])] = d(e[2]);

    return url_params;
}

// emphasize keyword from a text
function emphasize_keyword(text, keyword) {
    var keyword_list = keyword.replace(/[　\s]+/, " ").split(" ");

    for (var i = 0; i < keyword_list.length; i++) {
        var reg = new RegExp("(" + keyword_list[i] + ")", "gi");
        text = text.replace(reg, "<strong>$1</strong>");
    }

    return text;
}

$(function(){
    // for paging like: search result => search page using BACK button of browsers
    var hash_params = get_hash_params(location.hash);
    if (hash_params.q && "" != hash_params.q) {
        $("#q").val(hash_params.q);
        search();
    }

    // for paging like: page2 => page1 using BACK button of browsers
    $(window).bind("hashchange", function() {
        $('html,body').scrollTop(0);
        search();
    });
});

