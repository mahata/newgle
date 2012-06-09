$(function() {
    var options = [{"class": "search-engine", "title": "検索エンジン"},
                   {"class": "display-thumbnail", "title": "サムネイル表示"}],
        t = options.length;

    for (var i = 0; i < t; i++) {
        $("." + options[i]["class"]).bind("click", {"suffix": i}, function(event) {
            $("#message").hide();
            $("#message").fadeIn("slow");
            $("#message").text(options[event.data.suffix].title + " を " + $(this).attr("value").toUpperCase() + " に変更しました。");
            localStorage.setItem(options[event.data.suffix]["class"], $(this).attr("value"));
        });

        if (localStorage.getItem(options[i]["class"]) !== undefined) {
            $("#" + localStorage.getItem(options[i]["class"])).attr("checked", "checked");
        }
    }

    $("#return").click(function() { location.href = "/"; });
});
