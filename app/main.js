const net = require("net");
const { httpStatus, httpResponse, parseHttpRequest, HTTP_EOL } = require("./http")

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

/**
 * 
 * @param {string} uri 
 * @returns 
 */
const isEchoRequest = (uri) => {
  return uri.startsWith("/echo/")
}

const isAgentRequest = (uri) => {
  return uri == "/user-agent"
}

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {

  const writeSocket = (socket, data) => {
    socket.write(data, 'utf-8', (err) => {
        if (err) {
          console.log(err)
        }
      })
    socket.end();
  }

  socket.on("close", () => {
    socket.end();
    server.close();
  });

  socket.on("data", (data) => {
    const decodedBuffer = data.toString()
    console.log(decodedBuffer)

    const request = parseHttpRequest(decodedBuffer)

    if (request.requestLine.valid) {
      if (request.requestLine.requestUri == "/") {
        writeSocket(socket, `${httpStatus(200)}${HTTP_EOL}`);
      }
      else if (isEchoRequest(request.requestLine.requestUri)) {
        const content = request.requestLine.requestUri.substring(
          "/echo/".length
        )
        writeSocket(socket, httpResponse(200, content))
      }
      else if(isAgentRequest(request.requestLine.requestUri)) {
        console.log(request.headers)
        const content = request.headers['User-Agent']
        writeSocket(socket, httpResponse(200, content));
      } else {
        writeSocket(socket, `${httpStatus(404)}${HTTP_EOL}`);
      }
    } else {
      writeSocket(socket, `${httpStatus(500)}${HTTP_EOL}`);
    }

  })
});

server.listen(4221, "localhost");
