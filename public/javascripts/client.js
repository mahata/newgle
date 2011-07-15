var socket = new io.Socket('localhost');
var json = JSON.stringify;
socket.connect();

socket.on("message", function(message) {
              console.log("data from server");
              console.log(message);
          });

function send() {
    var q = $("#q").val();
    console.log(q);

    socket.send(json({q: q}));
};

function search() {
    console.log("do nothing temporarily.");
    $.getJSON("/api", {q: "mixi"}, function(json) {
                  console.log("search js: " + json);
                  // var json_obj = JSON.parse(json);
                  // console.log("search js: " + json);
                  console.log("search js: " + JSON.stringify(json));
                  
              });
}
