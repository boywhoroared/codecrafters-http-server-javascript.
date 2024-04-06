const net = require("net");
const { httpStatus, parseHttpRequest, END } = require("./http")

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");


// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  socket.on("data", (data) => {
    const decodedBuffer = data.toString()
    console.log(decodedBuffer)

    const request = parseHttpRequest(decodedBuffer)
    let status = (request.requestLine.valid && request.requestLine.requestUri == "/")
      ? httpStatus(200)
      : httpStatus(404)


    socket.write(`${status}${END}`, 'utf-8', (err) => {
      if (err) {
        console.log(err)
      }
    })
    socket.end();
  })
});

server.listen(4221, "localhost");
