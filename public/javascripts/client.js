function refresh(page) {
    location.hash = "#q=" + $("#q").val() + "&p=" + page;
    search();
}

function search() {
    var page = get_hash_params(location.hash).p ? get_hash_params(location.hash).p : 1;

    $.getJSON("/api", {
                  q: $("#q").val(),
                  p: page
              }, function(json) {
                  $("#search-summary").css("display","block");
                  $("#bing-logo").css("display","block");
                  $("#search-region").html("");
;
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
                          deep_link += "<div><ul class=\"search-result-deep-link\">";
                          var repeat_num = (json.SearchResponse.Web.Results[i].DeepLinks.length <= 5) ?
                              json.SearchResponse.Web.Results[i].DeepLinks.length : 5;
                          for (var j = 0; j < repeat_num; j++) {
                              deep_link += "<li><a href=\"" + json.SearchResponse.Web.Results[i].DeepLinks[j].Url + "\">" +
                                  "<span id=\"search-result-deep-link-" + i + "-" + j + "\">" +
                                  json.SearchResponse.Web.Results[i].DeepLinks[j].Title +
                                  "</span>" +
                                  "</a></li>";
                          }
                          deep_link += "</ul></div>";
                      }
                      $("#search-region").append("<li>" +
                                                 "<div class=\"search-result\">" +
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
                                                 json.SearchResponse.Web.Results[i].DisplayUrl +
                                                 "</span>" +
                                                 " - " +
                                                 "<a class=\"search-result-cache\" href=\"" + json.SearchResponse.Web.Results[i].CacheUrl + "\">キャッシュ</a>" +
                                                 deep_link +
                                                 "</div>" +
                                                 "</div>" +
                                                 "</li>");
                      $("#search-result-title-" + i).text(json.SearchResponse.Web.Results[i].Title);
                      $("#search-result-desc-" + i).text(json.SearchResponse.Web.Results[i].Description);
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
              });
}

function get_hash_params(loc_hash) {
    var url_params = {};
    var e;
    var a = /\+/g;
    var r = /([^&=]+)=?([^&]*)/g;
    var d = function (s) { return decodeURIComponent(s.replace(a, " ")); };
    var q = loc_hash.substring(1);

    while (e = r.exec(q))
        url_params[d(e[1])] = d(e[2]);

    return url_params;
}

window.onload = function() {
    var hash_params = get_hash_params(location.hash);
    if (hash_params.q && "" != hash_params.q) {
        $("#q").val(hash_params.q);
        search();
    }
}

