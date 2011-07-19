var socket = new io.Socket('localhost');
var json = JSON.stringify;
socket.connect();

socket.on("message", function(message) {
              console.log("data from server");
              console.log(message);
          });

function search() {
    console.log("did search.");

    $.getJSON("/api", {q: $("#q").val()}, function(json) {
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
                                  json.SearchResponse.Web.Results[i].DeepLinks[j].Title +
                                  "</a></li>";
                          }
                          deep_link += "</ul></div>";
                      }
                      $("#search-region").append("<li>" +
                                                 "<div class=\"search-result\">" +
                                                 "<h2 class=\"search-result-title\">" +
                                                 "<a href=\"" + json.SearchResponse.Web.Results[i].Url + "\">" +
                                                 json.SearchResponse.Web.Results[i].Title +
                                                 "</a>" +
                                                 "</h2>" +
                                                 "<p class=\"search-result-desc\">" +
                                                 json.SearchResponse.Web.Results[i].Description +
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

                  }
              });
}
