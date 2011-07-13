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
    // socket.send("foo");
};


