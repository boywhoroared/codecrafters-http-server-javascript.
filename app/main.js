const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const HTTP_STATUS_PREAMBLE = "HTTP/1.1"
const END = "\r\n"

const HTTP_STATUS = {
  200: "200 OK"
}

const httpStatus = (status) => {
  return `${HTTP_STATUS_PREAMBLE} ${HTTP_STATUS[status]}${END}`
}

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  socket.on("data", (data) => {
    const decodedBuffer = data.toString()
    console.log(decodedBuffer)

    socket.write(`${httpStatus(200)}${END}`, 'utf-8', (err) => {
      if (err) {
        console.log(err)
      }
    })
    socket.end();
  })
});

server.listen(4221, "localhost");
